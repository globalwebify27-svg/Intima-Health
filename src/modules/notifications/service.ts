import { connectDB } from "@/db/connect";
import { AppointmentModel } from "@/modules/appointments/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { TherapistModel } from "@/modules/therapists/schema";
import { PatientModel } from "@/modules/patients/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import { UserModel } from "@/modules/auth/schema";
import { NotificationModel } from "@/modules/system/schema";
import { ScheduledNotificationModel, NotificationMilestone } from "./schema";
import { getMailTransporterAsync, getMailTransporter, getResolvedMailConfig, getMailLogoAttachment } from "@/lib/mail/transporter";
import { generateDoctorTherapistReminderEmail, generatePatientReminderEmail } from "@/lib/mail/templates/appointment-reminder";
import { sendTemplateMessage } from "@/lib/whatsapp";
import mongoose from "mongoose";

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

    // Parse time (e.g., "10:00 AM", "10:00 - 10:50", "17:00")
    const cleanTime = timeStr.trim().toUpperCase();
    const firstTimePart = cleanTime.split("-")[0].trim();
    const isPM = cleanTime.includes("PM");
    const isAM = cleanTime.includes("AM");
    const numPart = firstTimePart.replace(/\s*(AM|PM)/i, "").trim();
    const [hStr, mStr] = numPart.split(":");
    let hours = parseInt(hStr, 10) || 9;
    const minutes = parseInt(mStr, 10) || 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    // Convert IST (UTC + 5:30) to UTC milliseconds
    const utcTimestamp = Date.UTC(year, month - 1, day, hours - 5, minutes - 30, 0, 0);
    return new Date(utcTimestamp);
  }

  /**
   * Schedule all automated notifications for Doctors/Therapists and Patients
   * whenever an appointment is booked or scheduled.
   */
  static async scheduleAppointmentNotifications(appointmentId: string): Promise<void> {
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

      // Upsert Doctor/Therapist Milestones
      for (const dm of doctorMilestones) {
        const scheduledFor = new Date(aptTime.getTime() - dm.offsetMins * 60 * 1000);
        // Skip past milestones if older than 5 minutes ago
        if (scheduledFor < fiveMinsAgo) continue;

        await ScheduledNotificationModel.findOneAndUpdate(
          {
            appointmentId: apt._id,
            recipientType: specialistRole === "Doctor" ? "DOCTOR" : "THERAPIST",
            milestone: dm.milestone,
          },
          {
            $set: {
              appointmentId: apt._id,
              recipientType: specialistRole === "Doctor" ? "DOCTOR" : "THERAPIST",
              recipientId: specialistId,
              recipientEmail: specialistEmail,
              recipientPhone: specialistPhone,
              milestone: dm.milestone,
              scheduledFor,
              channels: ["Email", "Push"],
              status: "Pending",
              metadata: sharedMetadata,
            },
          },
          { upsert: true, new: true }
        );
      }

      // Upsert Patient Milestones
      for (const pm of patientMilestones) {
        const scheduledFor = new Date(aptTime.getTime() - pm.offsetMins * 60 * 1000);
        // Skip past milestones if older than 5 minutes ago
        if (scheduledFor < fiveMinsAgo) continue;

        await ScheduledNotificationModel.findOneAndUpdate(
          {
            appointmentId: apt._id,
            recipientType: "PATIENT",
            milestone: pm.milestone,
          },
          {
            $set: {
              appointmentId: apt._id,
              recipientType: "PATIENT",
              recipientId: patient._id.toString(),
              recipientEmail: patient.email,
              recipientPhone: patient.phone,
              milestone: pm.milestone,
              scheduledFor,
              channels: ["Email", "WhatsApp", "Push"],
              status: "Pending",
              metadata: sharedMetadata,
            },
          },
          { upsert: true, new: true }
        );
      }

      console.log(`[AppointmentNotificationService] Scheduled notifications configured for Appointment ${appointmentId}`);

      // Dispatch immediately if any milestones are due right now
      await this.dispatchDueNotifications();
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
    await this.scheduleAppointmentNotifications(appointmentId);
  }

  /**
   * Dispatches all scheduled notifications that are due (scheduledFor <= now).
   * Avoids duplicate sends and guarantees idempotency.
   */
  static async dispatchDueNotifications(): Promise<{ processed: number; sent: number; failed: number }> {
    try {
      await connectDB();
      const now = new Date();
      // Fetch up to 50 due pending notifications
      const dueNotifications = await ScheduledNotificationModel.find({
        status: "Pending",
        scheduledFor: { $lte: now },
      })
        .limit(50)
        .exec();

      if (dueNotifications.length === 0) {
        return { processed: 0, sent: 0, failed: 0 };
      }

      let sentCount = 0;
      let failedCount = 0;

      const transporter = (await getMailTransporterAsync()) || getMailTransporter();
      const mailConfig = await getResolvedMailConfig();

      for (const notif of dueNotifications) {
        try {
          // Double check that the underlying appointment is still active
          const apt = await AppointmentModel.findById(notif.appointmentId).lean().exec();
          if (!apt || apt.status === "Cancelled" || apt.status === "Completed") {
            notif.status = "Cancelled";
            await notif.save();
            continue;
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

      return { processed: dueNotifications.length, sent: sentCount, failed: failedCount };
    } catch (err) {
      console.error("[AppointmentNotificationService] Error during dispatchDueNotifications:", err);
      return { processed: 0, sent: 0, failed: 0 };
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
