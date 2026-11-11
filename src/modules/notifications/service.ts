import { connectDB } from "@/db/connect";
import { AppointmentModel } from "@/modules/appointments/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { TherapistModel } from "@/modules/therapists/schema";
import { PatientModel } from "@/modules/patients/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import { UserModel } from "@/modules/auth/schema";
import { NotificationModel } from "@/modules/system/schema";
import { ScheduledNotificationModel, NotificationMilestone, IScheduledNotification } from "./schema";
import { getMailTransporterAsync, getMailTransporter, getResolvedMailConfig, getMailLogoAttachment } from "@/lib/mail/transporter";
import { generateDoctorTherapistReminderEmail, generatePatientReminderEmail } from "@/lib/mail/templates/appointment-reminder";
import { sendTemplateMessage } from "@/lib/whatsapp";
import mongoose from "mongoose";

const APPOINTMENT_GRACE_MS = 15 * 60 * 1000;

const MILESTONE_MAX_DELAY_MS: Record<NotificationMilestone, number> = {
  DOCTOR_1D: 6 * 60 * 60 * 1000,
  PATIENT_3H: 45 * 60 * 1000,
  PATIENT_2H: 45 * 60 * 1000,
  PATIENT_1H: 30 * 60 * 1000,
  DOCTOR_1H: 30 * 60 * 1000,
  PATIENT_10M: 15 * 60 * 1000,
  DOCTOR_10M: 15 * 60 * 1000,
  PATIENT_AT_TIME: 15 * 60 * 1000,
  DOCTOR_AT_TIME: 15 * 60 * 1000,
};

export class AppointmentNotificationService {
  /**
   * Parse appointment date & time string into an exact UTC Date based on Asia/Kolkata (IST).
   */
  static parseAppointmentDateTime(dateStr: string, timeStr: string): Date {
    const rawParts = dateStr.trim().split(/[-/]/).map(Number);
    let year: number;
    let month: number;
    let day: number;

    if (rawParts[0] > 1000) {
      year = rawParts[0];
      month = rawParts[1];
      day = rawParts[2];
    } else {
      day = rawParts[0];
      month = rawParts[1];
      year = rawParts[2];
    }

    // Parse time (e.g., "10:00 AM", "10:00 - 10:50", "17:00", "00:30")
    const cleanTime = timeStr.trim().toUpperCase();
    const firstTimePart = cleanTime.split("-")[0].trim();
    const firstHasPeriod = firstTimePart.includes("AM") || firstTimePart.includes("PM");
    const isPM = firstHasPeriod ? firstTimePart.includes("PM") : cleanTime.includes("PM");
    const isAM = firstHasPeriod ? firstTimePart.includes("AM") : cleanTime.includes("AM");
    const numPart = firstTimePart.replace(/\s*(AM|PM)/i, "").trim();
    const [hStr, mStr] = numPart.split(":");
    const parsedHours = parseInt(hStr, 10);
    const parsedMinutes = parseInt(mStr, 10);
    let hours = Number.isNaN(parsedHours) ? 9 : parsedHours;
    const minutes = Number.isNaN(parsedMinutes) ? 0 : parsedMinutes;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    // Convert IST (UTC + 5:30) to UTC milliseconds
    const utcTimestamp = Date.UTC(year, month - 1, day, hours - 5, minutes - 30, 0, 0);
    return new Date(utcTimestamp);
  }

  private static async upsertMilestoneNotification(params: {
    appointmentId: IScheduledNotification["appointmentId"];
    recipientType: "DOCTOR" | "THERAPIST" | "PATIENT";
    recipientId: string;
    recipientEmail?: string;
    recipientPhone?: string;
    milestone: NotificationMilestone;
    scheduledFor: Date;
    channels: Array<"Email" | "WhatsApp" | "Push">;
    metadata: IScheduledNotification["metadata"];
    fiveMinsAgo: Date;
    isReschedule: boolean;
    existing?: { _id: mongoose.Types.ObjectId; status: IScheduledNotification["status"]; scheduledFor: Date };
  }): Promise<void> {
    const {
      appointmentId,
      recipientType,
      recipientId,
      recipientEmail,
      recipientPhone,
      milestone,
      scheduledFor,
      channels,
      metadata,
      fiveMinsAgo,
      isReschedule,
      existing,
    } = params;

    if (scheduledFor < fiveMinsAgo) {
      if (existing && existing.status === "Pending") {
        await ScheduledNotificationModel.updateOne(
          { _id: existing._id, status: "Pending" },
          { $set: { status: "Cancelled", failureReason: "Milestone already in the past" } }
        );
      }
      return;
    }

    const payload = {
      appointmentId,
      recipientType,
      recipientId,
      recipientEmail,
      recipientPhone,
      milestone,
      scheduledFor,
      channels,
      metadata,
    };

    if (!existing) {
      await ScheduledNotificationModel.updateOne(
        { appointmentId, recipientType, milestone },
        { $setOnInsert: { ...payload, status: "Pending" } },
        { upsert: true }
      );
      return;
    }

    const alreadyDelivered = existing.status === "Sent" || existing.status === "Processing";
    if (alreadyDelivered) {
      const sameSchedule =
        Math.abs(new Date(existing.scheduledFor).getTime() - scheduledFor.getTime()) <= 60_000;
      if (!isReschedule || sameSchedule) {
        return;
      }
    }

    await ScheduledNotificationModel.updateOne(
      { _id: existing._id, ...(alreadyDelivered ? {} : { status: { $nin: ["Sent", "Processing"] } }) },
      {
        $set: { ...payload, status: "Pending" },
        $unset: { processingStartedAt: "", failureReason: "", sentAt: "" },
      }
    );
  }

  /**
   * Schedule all automated notifications for Doctors/Therapists and Patients
   * whenever an appointment is booked or scheduled.
   */
  static async scheduleAppointmentNotifications(
    appointmentId: string,
    options?: { isReschedule?: boolean }
  ): Promise<void> {
    try {
      await connectDB();
      const apt = await AppointmentModel.findById(appointmentId)
        .populate("patientId")
        .populate("doctorId")
        .populate("clinicId")
        .exec();

      if (!apt) {
        console.warn(`[AppointmentNotificationService] Appointment ${appointmentId} not found.`);
        return;
      }

      if (apt.status === "Cancelled" || apt.status === "Completed") {
        return;
      }

      const patient = apt.patientId as any;
      if (!patient) return;

      // Identify Doctor vs Therapist
      let specialistName = "Specialist";
      let specialistRole: "Doctor" | "Therapist" = "Doctor";
      let specialistSpecialization = "";
      let specialistEmail = "";
      let specialistPhone = "";
      let specialistId = "";

      const rawDoctor = apt.doctorId as any;
      if (rawDoctor) {
        specialistId = rawDoctor._id?.toString() || rawDoctor.toString();
        // Check Doctor collection first
        const docRecord = await DoctorModel.findById(specialistId).lean().exec();
        if (docRecord) {
          specialistName = docRecord.name;
          specialistRole = "Doctor";
          specialistSpecialization = docRecord.specialization || "Psychiatrist";
          specialistEmail = docRecord.email;
          specialistPhone = docRecord.phone;
        } else {
          // Check Therapist collection
          const therapistRecord = await TherapistModel.findById(specialistId).lean().exec();
          if (therapistRecord) {
            specialistName = therapistRecord.name;
            specialistRole = "Therapist";
            specialistSpecialization = therapistRecord.specialization || "Clinical Psychologist";
            specialistEmail = therapistRecord.email;
            specialistPhone = therapistRecord.phone;
          } else {
            specialistName = rawDoctor.name || "Specialist";
            specialistEmail = rawDoctor.email || "";
            specialistPhone = rawDoctor.phone || "";
          }
        }
      }

      // Clinic details
      const clinic = apt.clinicId as any;
      const clinicName = clinic?.name || "Kelkar Manas Health Care";
      const clinicAddress = clinic ? `${clinic.address}, ${clinic.city}` : "Civil Lines, Akola / Thane West, Maharashtra";

      // Video link resolution
      const isVideo = apt.type === "Video";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kelkarmanasclinic.com";
      const videoLink = isVideo
        ? (specialistRole === "Therapist"
            ? `${appUrl}/patient/therapy-session/${apt._id}`
            : `${appUrl}/patient/consultations?room=${apt.videoChannelName || apt._id}`)
        : undefined;

      // Compute appointment start time
      const aptTime = this.parseAppointmentDateTime(apt.date, apt.time);
      const now = new Date();
      const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // 1. Doctor & Therapist Schedule Milestones:
      // 1 day before, 1 hour before, 10 minutes before, At scheduled time
      const doctorMilestones: Array<{ milestone: NotificationMilestone; offsetMins: number }> = [
        { milestone: "DOCTOR_1D", offsetMins: 24 * 60 },
        { milestone: "DOCTOR_1H", offsetMins: 60 },
        { milestone: "DOCTOR_10M", offsetMins: 10 },
        { milestone: "DOCTOR_AT_TIME", offsetMins: 0 },
      ];

      // 2. Patient Schedule Milestones:
      // 3 hours before, 2 hours before, 1 hour before, 10 minutes before, At scheduled time
      const patientMilestones: Array<{ milestone: NotificationMilestone; offsetMins: number }> = [
        { milestone: "PATIENT_3H", offsetMins: 180 },
        { milestone: "PATIENT_2H", offsetMins: 120 },
        { milestone: "PATIENT_1H", offsetMins: 60 },
        { milestone: "PATIENT_10M", offsetMins: 10 },
        { milestone: "PATIENT_AT_TIME", offsetMins: 0 },
      ];

      const sharedMetadata = {
        appointmentType: (apt.type || "Walk-in") as "Video" | "Walk-in",
        date: apt.date,
        time: apt.time,
        patientName: patient.name || "Patient",
        specialistName,
        specialistRole,
        specialization: specialistSpecialization,
        clinicName,
        clinicAddress,
        videoLink,
      };

      const existingDocs = await ScheduledNotificationModel.find({
        appointmentId: apt._id,
      })
        .select("_id recipientType milestone status scheduledFor")
        .lean()
        .exec();

      const existingMap = new Map<string, { _id: mongoose.Types.ObjectId; status: IScheduledNotification["status"]; scheduledFor: Date }>();
      for (const doc of existingDocs) {
        existingMap.set(`${doc.recipientType}:${doc.milestone}`, {
          _id: doc._id as mongoose.Types.ObjectId,
          status: doc.status,
          scheduledFor: doc.scheduledFor,
        });
      }

      const isReschedule = Boolean(options?.isReschedule);
      const doctorRecipientType = specialistRole === "Doctor" ? "DOCTOR" : "THERAPIST";

      const typedAppointmentId = apt._id as unknown as IScheduledNotification["appointmentId"];

      // Upsert Doctor/Therapist Milestones
      for (const dm of doctorMilestones) {
        const scheduledFor = new Date(aptTime.getTime() - dm.offsetMins * 60 * 1000);
        await this.upsertMilestoneNotification({
          appointmentId: typedAppointmentId,
          recipientType: doctorRecipientType,
          recipientId: specialistId,
          recipientEmail: specialistEmail,
          recipientPhone: specialistPhone,
          milestone: dm.milestone,
          scheduledFor,
          channels: ["Email", "Push"],
          metadata: sharedMetadata,
          fiveMinsAgo,
          isReschedule,
          existing: existingMap.get(`${doctorRecipientType}:${dm.milestone}`),
        });
      }

      // Upsert Patient Milestones
      for (const pm of patientMilestones) {
        const scheduledFor = new Date(aptTime.getTime() - pm.offsetMins * 60 * 1000);
        await this.upsertMilestoneNotification({
          appointmentId: typedAppointmentId,
          recipientType: "PATIENT",
          recipientId: patient._id.toString(),
          recipientEmail: patient.email,
          recipientPhone: patient.phone,
          milestone: pm.milestone,
          scheduledFor,
          channels: ["Email", "WhatsApp", "Push"],
          metadata: sharedMetadata,
          fiveMinsAgo,
          isReschedule,
          existing: existingMap.get(`PATIENT:${pm.milestone}`),
        });
      }

      console.log(`[AppointmentNotificationService] Scheduled notifications configured for Appointment ${appointmentId}`);

      // Dispatch immediately if any milestones are due right now
      await this.dispatchDueNotifications({ limit: 10 });
    } catch (error) {
      console.error("[AppointmentNotificationService] Error scheduling notifications:", error);
    }
  }

  /**
   * Cancel all pending scheduled notifications when an appointment is cancelled.
   */
  static async cancelAppointmentNotifications(appointmentId: string): Promise<void> {
    try {
      await connectDB();
      const result = await ScheduledNotificationModel.updateMany(
        { appointmentId: appointmentId as any, status: "Pending" },
        { $set: { status: "Cancelled" } }
      );
      console.log(`[AppointmentNotificationService] Cancelled ${result.modifiedCount} pending notifications for ${appointmentId}`);
    } catch (error) {
      console.error("[AppointmentNotificationService] Error cancelling notifications:", error);
    }
  }

  /**
   * Reschedule notifications: Cancel old pending ones and recalculate for the new date/time.
   */
  static async rescheduleAppointmentNotifications(appointmentId: string): Promise<void> {
    await this.cancelAppointmentNotifications(appointmentId);
    await this.scheduleAppointmentNotifications(appointmentId, { isReschedule: true });
  }

  /**
   * Dispatches all scheduled notifications that are due (scheduledFor <= now).
   * Atomically claims each Pending notification before sending to prevent duplicate
   * delivery under concurrent requests, and cancels stale reminders for past appointments.
   */
  static async dispatchDueNotifications(
    options?: { limit?: number }
  ): Promise<{ processed: number; sent: number; failed: number; cancelled: number }> {
    try {
      await connectDB();
      const now = new Date();
      const limit = options?.limit ?? 50;

      // Bulk-cancel ancient pending reminders (>24h overdue) before claiming
      const ancientCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const bulkExpired = await ScheduledNotificationModel.updateMany(
        { status: "Pending", scheduledFor: { $lt: ancientCutoff } },
        { $set: { status: "Cancelled", failureReason: "Expired before dispatch" } }
      );

      let processedCount = 0;
      let sentCount = 0;
      let failedCount = 0;
      let cancelledCount = bulkExpired.modifiedCount || 0;

      let transporter: Awaited<ReturnType<typeof getMailTransporterAsync>> | ReturnType<typeof getMailTransporter> | undefined;
      let mailConfig: Awaited<ReturnType<typeof getResolvedMailConfig>> | undefined;

      for (let i = 0; i < limit; i++) {
        // Atomically claim one due notification so concurrent workers cannot pick up the same row
        const notif = await ScheduledNotificationModel.findOneAndUpdate(
          {
            status: "Pending",
            scheduledFor: { $lte: now },
          },
          {
            $set: {
              status: "Processing",
              processingStartedAt: new Date(),
            },
          },
          {
            sort: { scheduledFor: 1 },
            new: true,
          }
        ).exec();

        if (!notif) {
          break;
        }

        processedCount++;

        try {
          // Double check that the underlying appointment is still active
          const apt = await AppointmentModel.findById(notif.appointmentId).lean().exec();
          if (!apt || apt.status === "Cancelled" || apt.status === "Completed") {
            notif.status = "Cancelled";
            notif.failureReason = "Appointment cancelled or completed";
            await notif.save();
            cancelledCount++;
            continue;
          }

          // Reject stale reminders: never dispatch after appointment start + grace or past milestone window
          const aptTime = this.parseAppointmentDateTime(apt.date || notif.metadata.date, apt.time || notif.metadata.time);
          const isPastAppointment = now.getTime() > aptTime.getTime() + APPOINTMENT_GRACE_MS;
          const maxDelayMs = MILESTONE_MAX_DELAY_MS[notif.milestone] ?? 30 * 60 * 1000;
          const isWindowExpired = now.getTime() - new Date(notif.scheduledFor).getTime() > maxDelayMs;

          if (isPastAppointment || isWindowExpired) {
            notif.status = "Cancelled";
            notif.failureReason = isPastAppointment
              ? "Appointment time has already passed"
              : "Reminder window expired";
            await notif.save();
            cancelledCount++;
            continue;
          }

          if (transporter === undefined) {
            transporter = (await getMailTransporterAsync()) || getMailTransporter();
            mailConfig = await getResolvedMailConfig();
          }

          const isDoctorOrTherapist = notif.recipientType === "DOCTOR" || notif.recipientType === "THERAPIST";
          const isPatient = notif.recipientType === "PATIENT";

          // --- 1. EMAIL DISPATCH ---
          if (notif.channels.includes("Email") && notif.recipientEmail) {
            try {
              if (transporter && mailConfig) {
                if (isDoctorOrTherapist) {
                  const { subject, html } = generateDoctorTherapistReminderEmail({
                    recipientName: notif.metadata.specialistName,
                    patientName: notif.metadata.patientName,
                    specialistName: notif.metadata.specialistName,
                    specialistRole: notif.metadata.specialistRole,
                    specialization: notif.metadata.specialization,
                    date: notif.metadata.date,
                    time: notif.metadata.time,
                    type: notif.metadata.appointmentType,
                    clinicName: notif.metadata.clinicName,
                    clinicAddress: notif.metadata.clinicAddress,
                    videoLink: notif.metadata.videoLink,
                    milestone: notif.milestone,
                  });

                  await transporter.sendMail({
                    from: `"${mailConfig.fromName}" <${mailConfig.fromEmail}>`,
                    to: notif.recipientEmail,
                    subject,
                    html,
                    attachments: getMailLogoAttachment(),
                  });
                } else if (isPatient) {
                  const { subject, html } = generatePatientReminderEmail({
                    recipientName: notif.metadata.patientName,
                    patientName: notif.metadata.patientName,
                    specialistName: notif.metadata.specialistName,
                    specialistRole: notif.metadata.specialistRole,
                    specialization: notif.metadata.specialization,
                    date: notif.metadata.date,
                    time: notif.metadata.time,
                    type: notif.metadata.appointmentType,
                    clinicName: notif.metadata.clinicName,
                    clinicAddress: notif.metadata.clinicAddress,
                    videoLink: notif.metadata.videoLink,
                    milestone: notif.milestone,
                  });

                  await transporter.sendMail({
                    from: `"${mailConfig.fromName}" <${mailConfig.fromEmail}>`,
                    to: notif.recipientEmail,
                    subject,
                    html,
                    attachments: getMailLogoAttachment(),
                  });
                }
              }
            } catch (mailErr) {
              console.error(`[AppointmentNotificationService] Email error for ${notif.recipientEmail}:`, mailErr);
            }
          }

          // --- 2. WHATSAPP DISPATCH (Patients) ---
          if (isPatient && notif.channels.includes("WhatsApp") && notif.recipientPhone) {
            try {
              const patientName = notif.metadata.patientName;
              const doctorName = notif.metadata.specialistRole === "Doctor"
                ? `Dr. ${notif.metadata.specialistName}`
                : notif.metadata.specialistName;
              const mode = notif.metadata.appointmentType === "Video" ? "Video Consultation" : "In-Clinic Visit";
              const clinicLocation = notif.metadata.appointmentType === "Video"
                ? (notif.metadata.videoLink || "Video Link in Portal")
                : (notif.metadata.clinicAddress || notif.metadata.clinicName || "Clinic");

              await sendTemplateMessage({
                recipientId: notif.recipientId,
                recipientType: "PATIENT",
                phone: notif.recipientPhone,
                campaignName: "appointment_reminder",
                templateParams: [
                  patientName,
                  doctorName,
                  notif.metadata.date,
                  notif.metadata.time,
                  mode,
                  clinicLocation,
                ],
              });
            } catch (waErr) {
              console.error(`[AppointmentNotificationService] WhatsApp error for ${notif.recipientPhone}:`, waErr);
            }
          }

          // --- 3. IN-APP / PUSH NOTIFICATION ---
          try {
            const milestoneText = notif.milestone.includes("1D")
              ? "tomorrow"
              : notif.milestone.includes("3H")
              ? "in 3 hours"
              : notif.milestone.includes("2H")
              ? "in 2 hours"
              : notif.milestone.includes("1H")
              ? "in 1 hour"
              : notif.milestone.includes("10M")
              ? "in 10 minutes"
              : "starting now";

            const title = isDoctorOrTherapist
              ? `Appointment with ${notif.metadata.patientName} (${milestoneText})`
              : `Appointment with ${notif.metadata.specialistName} (${milestoneText})`;

            const message = notif.metadata.appointmentType === "Video"
              ? `Your online video consultation is scheduled for ${notif.metadata.date} at ${notif.metadata.time}. Click to join.`
              : `Your in-clinic visit is scheduled for ${notif.metadata.date} at ${notif.metadata.time} at ${notif.metadata.clinicName}.`;

            // Also find user account ID if recipientId is patient or doctor profile ID
            let targetUserId = notif.recipientId;
            const userRec = await UserModel.findOne({
              $or: [
                { patientId: notif.recipientId },
                { doctorId: notif.recipientId },
                { therapistId: notif.recipientId },
                { email: notif.recipientEmail },
              ],
            }).lean().exec();

            if (userRec) {
              targetUserId = userRec._id.toString();
            }

            await NotificationModel.create({
              recipientId: targetUserId,
              recipientType: notif.recipientType,
              channel: "Push",
              title,
              message,
              status: "Sent",
              read: false,
              metadata: {
                appointmentId: notif.appointmentId.toString(),
                milestone: notif.milestone,
                type: notif.metadata.appointmentType,
                videoLink: notif.metadata.videoLink,
                date: notif.metadata.date,
                time: notif.metadata.time,
              },
            });
          } catch (pushErr) {
            console.error("[AppointmentNotificationService] In-App push log error:", pushErr);
          }

          // Mark notification as Sent
          notif.status = "Sent";
          notif.sentAt = new Date();
          await notif.save();
          sentCount++;
        } catch (itemErr: any) {
          console.error(`[AppointmentNotificationService] Failed to dispatch notif ${notif._id}:`, itemErr);
          notif.status = "Failed";
          notif.failureReason = itemErr.message || "Dispatch error";
          await notif.save();
          failedCount++;
        }
      }

      return { processed: processedCount, sent: sentCount, failed: failedCount, cancelled: cancelledCount };
    } catch (err) {
      console.error("[AppointmentNotificationService] Error during dispatchDueNotifications:", err);
      return { processed: 0, sent: 0, failed: 0, cancelled: 0 };
    }
  }

  /**
   * Backfill notification schedule for all upcoming active appointments.
   */
  static async backfillUpcomingAppointments(): Promise<number> {
    try {
      await connectDB();
      const todayStr = new Date().toISOString().split("T")[0];
      const upcomingApts = await AppointmentModel.find({
        status: { $in: ["Scheduled", "Rescheduled"] },
        date: { $gte: todayStr },
      }).select("_id").lean().exec();

      let count = 0;
      for (const apt of upcomingApts) {
        await this.scheduleAppointmentNotifications(apt._id.toString());
        count++;
      }
      return count;
    } catch (err) {
      console.error("[AppointmentNotificationService] Backfill error:", err);
      return 0;
    }
  }
}
