import { AppointmentRepository } from "./repository";
import { DoctorRepository } from "@/modules/doctors/repository";
import { AppointmentModel, IAppointment } from "./schema";
import { ISlot, IBookAppointmentInput, IRescheduleInput } from "./types";
import { BookAppointmentSchema, RescheduleAppointmentSchema } from "./validators";
import { sendAppointmentBookingMessage } from "@/lib/whatsapp";
import { sendAppointmentCustomerEmail } from "@/lib/mail/service";
import { PlatformServiceModel } from "@/modules/services/schema";
import { AppointmentNotificationService } from "@/modules/notifications/service";

export class AppointmentService {
  // Helper to parse time string in 12h or 24h format to minutes from midnight
  private static parseTimeToMinutes(timeStr?: string): number {
    if (!timeStr) return -1;
    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes("PM");
    const isAM = clean.includes("AM");
    const numericPart = clean.replace(/\s*(AM|PM)/i, "").trim();
    const parts = numericPart.split(":");
    if (parts.length < 2) return -1;
    let hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return -1;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // Helper to split availability blocks into custom-min slots
  private static generateTimeSlots(startStr: string, endStr: string, slotDuration = 30): string[] {
    const slots: string[] = [];
    const startM = this.parseTimeToMinutes(startStr);
    const endM = this.parseTimeToMinutes(endStr);
    if (startM === -1 || endM === -1 || startM >= endM) return [];

    let current = startM;
    while (current + slotDuration <= endM) {
      const h24 = Math.floor(current / 60);
      const m = current % 60;
      const formatted = `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push(formatted);
      current += slotDuration;
    }

    return slots;
  }

  // Get available slots for a doctor on a specific date
  static async calculateAvailableSlots(doctorId: string, dateStr: string): Promise<ISlot[]> {
    const doctor = await DoctorRepository.findById(doctorId);
    if (!doctor) {
      throw new Error("Doctor not found.");
    }

    const duration = doctor.slotDuration || 30;

    // Determine the day of the week
    const dateObj = new Date(dateStr);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const queryDay = daysOfWeek[dateObj.getUTCDay()];

    // Find doctor availability for this day
    const dayAvail = doctor.availability.find(av => av.day === queryDay);
    if (!dayAvail || dayAvail.slots.length === 0) {
      return []; // Not available on this day
    }

    // Generate potential slots from doctor blocks
    const seenBlocks = new Set<string>();
    const potentialStartTimes: string[] = [];
    for (const block of dayAvail.slots) {
      const blockKey = `${block.start?.trim()}-${block.end?.trim()}`;
      if (seenBlocks.has(blockKey)) continue;
      seenBlocks.add(blockKey);
      const blocks = this.generateTimeSlots(block.start, block.end, duration);
      potentialStartTimes.push(...blocks);
    }
    const uniqueStartTimes = Array.from(new Set(potentialStartTimes)).sort();

    // Get active bookings
    const bookings = await AppointmentRepository.findBookedAppointments(doctorId, dateStr);
    const bookedTimes = new Set(bookings.map(b => {
      const t = b.time.trim();
      if (t.includes(" AM") || t.includes(" PM") || t.includes(" am") || t.includes(" pm")) {
        const [timePart, modifier] = t.split(/\s+/);
        const [rawHours, minutes] = timePart.split(":");
        let hours = rawHours;
        if (hours === "12") hours = "00";
        if (modifier.toUpperCase() === "PM") {
          hours = String(parseInt(hours, 10) + 12);
        }
        return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
      }
      if (t.includes(":")) {
        const parts = t.split(":");
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
      }
      return t;
    }));

    // Construct slot objects
    let slots = uniqueStartTimes.map(time => {
      // Calculate end time
      let [h, m] = time.split(":").map(Number);
      m += duration;
      if (m >= 60) {
        h += Math.floor(m / 60);
        m = m % 60;
      }
      const endTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      return {
        start: time,
        end: endTime,
        available: !bookedTimes.has(time),
      };
    });

    // If selected date is today, filter out past slots based on IST time (Asia/Kolkata)
    const istTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const nowIST = new Date(istTimeStr);
    
    const [qYear, qMonth, qDay] = dateStr.split("-").map(Number);
    const isPast = (
      nowIST.getFullYear() > qYear ||
      (nowIST.getFullYear() === qYear && (nowIST.getMonth() + 1) > qMonth) ||
      (nowIST.getFullYear() === qYear && (nowIST.getMonth() + 1) === qMonth && nowIST.getDate() > qDay)
    );

    if (isPast) {
      return [];
    }

    const isToday = (
      nowIST.getFullYear() === qYear &&
      (nowIST.getMonth() + 1) === qMonth &&
      nowIST.getDate() === qDay
    );

    if (isToday) {
      const currentHour = nowIST.getHours();
      const currentMin = nowIST.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMin;

      slots = slots.filter(slot => {
        const [slotHour, slotMin] = slot.start.split(":").map(Number);
        const slotTimeInMinutes = slotHour * 60 + slotMin;
        return slotTimeInMinutes >= currentTimeInMinutes;
      });
    }

    return slots;
  }

  // Book a new appointment
  static async bookAppointment(input: any, createdBy?: string): Promise<IAppointment> {
    const validated = BookAppointmentSchema.parse(input);

    const doctor = await DoctorRepository.findById(validated.doctorId);
    if (!doctor) {
      throw new Error("Doctor not found.");
    }

    // Verify slots availability
    const slots = await this.calculateAvailableSlots(validated.doctorId, validated.date);
    const chosenSlot = slots.find(s => s.start === validated.time);
    
    if (!chosenSlot) {
      throw new Error("The selected time slot is outside the doctor's available schedule.");
    }
    if (!chosenSlot.available) {
      throw new Error("The selected time slot is already booked.");
    }

    let calculatedFee = (doctor as any).consultationFee || 0;
    if (validated.serviceName) {
      const serviceRecord = await PlatformServiceModel.findOne({ name: validated.serviceName });
      if (serviceRecord && serviceRecord.price) {
        calculatedFee = serviceRecord.price;
      }
    }


    const created = await AppointmentRepository.create({
      patientId: validated.patientId as any,
      doctorId: validated.doctorId as any,
      clinicId: doctor.clinicId as any,
      date: validated.date,
      time: validated.time,
      type: validated.type,
      serviceName: validated.serviceName,
      notes: validated.notes,
      status: "Scheduled",
      paymentMethod: validated.paymentMethod || "Online",
      paymentStatus: validated.paymentStatus || "Pending",
      transactionId: validated.transactionId,
      feeAmount: calculatedFee,
      createdBy,
    });

    // Send WhatsApp notification (contains appointment details and payment link)
    if (!input.skipNotification) {
      await sendAppointmentBookingMessage((created as any)._id.toString());
      // Send Email confirmation asynchronously to customer
      sendAppointmentCustomerEmail((created as any)._id.toString()).catch((err) => {
        console.error("[Appointments] Email notification error:", err);
      });
    }

    // Schedule automated notifications for Doctors/Therapists and Patients (1d, 3h, 2h, 1h, 10m, at-time)
    AppointmentNotificationService.scheduleAppointmentNotifications((created as any)._id.toString()).catch((err) => {
      console.error("[Appointments] Automated notification scheduling error:", err);
    });

    return created;
  }

  // Reschedule
  static async reschedule(id: string, input: any, updatedBy?: string): Promise<IAppointment> {
    const validated = RescheduleAppointmentSchema.parse(input);

    const apt = await AppointmentRepository.findById(id);
    if (!apt) {
      throw new Error("Appointment not found.");
    }

    // Verify slots availability
    const doctorIdStr = (apt.doctorId as any)._id ? String((apt.doctorId as any)._id) : String(apt.doctorId);
    const slots = await this.calculateAvailableSlots(doctorIdStr, validated.date);
    const chosenSlot = slots.find(s => s.start === validated.time);

    if (!chosenSlot) {
      throw new Error("The selected time slot is outside the doctor's available schedule.");
    }
    if (!chosenSlot.available) {
      throw new Error("The selected time slot is already booked.");
    }

    const updated = await AppointmentRepository.update(id, {
      date: validated.date,
      time: validated.time,
      status: "Rescheduled",
      updatedBy,
    });

    if (!updated) {
      throw new Error("Failed to reschedule appointment.");
    }

    // Reschedule automated notification schedule for updated date/time
    AppointmentNotificationService.rescheduleAppointmentNotifications(id).catch((err) => {
      console.error("[Appointments] Notification reschedule error:", err);
    });

    return updated;
  }

  // Cancel
  static async cancel(id: string, updatedBy?: string): Promise<IAppointment> {
    const updated = await AppointmentRepository.update(id, {
      status: "Cancelled",
      updatedBy,
    });
    if (!updated) {
      throw new Error("Appointment not found.");
    }

    // Cancel all pending scheduled notification reminders
    AppointmentNotificationService.cancelAppointmentNotifications(id).catch((err) => {
      console.error("[Appointments] Notification cancellation error:", err);
    });

    return updated;
  }

  static async updateStatus(id: string, status: string, updatedBy?: string): Promise<IAppointment> {
    const updated = await AppointmentRepository.update(id, {
      status: status as any,
      updatedBy,
    });
    if (!updated) {
      throw new Error("Appointment not found.");
    }

    if (status === "Cancelled" || status === "Completed") {
      AppointmentNotificationService.cancelAppointmentNotifications(id).catch((err) => {
        console.error("[Appointments] Notification cancel on status change error:", err);
      });
    } else if (status === "Rescheduled") {
      AppointmentNotificationService.rescheduleAppointmentNotifications(id).catch((err) => {
        console.error("[Appointments] Notification reschedule on status change error:", err);
      });
    }

    return updated;
  }

  static async getAppointments(filters: {
    doctorId?: string;
    patientId?: string;
    date?: string;
    status?: string;
    clinicId?: string;
    paymentStatus?: string;
  }) {
    const list = await AppointmentRepository.list(filters);

    // Auto-cancel past Scheduled appointments
    const todayStr = new Date().toISOString().split("T")[0];
    const expiredAppointments = list.filter(apt => 
      apt.status === "Scheduled" && apt.date < todayStr
    );

    if (expiredAppointments.length > 0) {
      const expiredIds = expiredAppointments.map(apt => (apt as any)._id);
      await AppointmentModel.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: "Cancelled", updatedBy: "system" } }
      );
      for (const apt of expiredAppointments) {
        (apt as any).status = "Cancelled";
      }
    }

    // Auto-sync completed & paid therapy sessions + successful gateway payments to Appointment records
    if (filters.patientId) {
      try {
        const { TherapySessionModel, PaymentModel } = await import("@/modules/pharmacy/schema");
        const { ObjectId } = await import("mongodb");
        const patientIdVariants: any[] = [filters.patientId];
        if (typeof filters.patientId === "string" && ObjectId.isValid(filters.patientId)) {
          patientIdVariants.push(new ObjectId(filters.patientId));
        }

        // 1. Sync successful PaymentModel records linked directly to any of these appointments
        const aptIds = list.map((apt) => (apt as any)._id).filter(Boolean);
        if (aptIds.length > 0) {
          const successfulPayments = await PaymentModel.find({
            appointmentId: { $in: aptIds },
            status: "Success",
          })
            .select("appointmentId gatewayTransactionId gatewayProvider")
            .lean();

          if (successfulPayments.length > 0) {
            const payMap = new Map<string, any>();
            for (const sp of successfulPayments) {
              if (sp.appointmentId) payMap.set(String(sp.appointmentId), sp);
            }
            const toMarkPaidIds: any[] = [];
            for (const apt of list) {
              const sp = payMap.get(String((apt as any)._id));
              if (sp && (apt as any).paymentStatus !== "Paid") {
                toMarkPaidIds.push((apt as any)._id);
                (apt as any).paymentStatus = "Paid";
                if (!(apt as any).transactionId && sp.gatewayTransactionId) {
                  (apt as any).transactionId = sp.gatewayTransactionId;
                }
              }
            }
            if (toMarkPaidIds.length > 0) {
              await AppointmentModel.updateMany(
                { _id: { $in: toMarkPaidIds } },
                { $set: { paymentStatus: "Paid", updatedBy: "payment-sync" } }
              );
            }
          }
        }

        // 2. Sync paid / completed therapy sessions to mirrored Appointment records
        const syncedSessions = await TherapySessionModel.find({
          patientId: { $in: patientIdVariants },
          $or: [
            { status: { $in: ["Completed", "Paid"] } },
            { paymentStatus: "Paid" },
            { transactionId: { $exists: true, $ne: "" } },
          ],
        }).lean();

        if (syncedSessions.length > 0) {
          const toCompleteIds: any[] = [];
          const toMarkPaidFromTherapy: any[] = [];

          for (const cs of syncedSessions) {
            const isTherapyCompleted = cs.status === "Completed";
            const isTherapyPaid =
              cs.paymentStatus === "Paid" ||
              cs.status === "Paid" ||
              cs.status === "Completed" ||
              Boolean(cs.transactionId);

            for (const apt of list) {
              const nameMatch = !!(
                cs.name &&
                (apt as any).serviceName &&
                cs.name.trim().toLowerCase() === (apt as any).serviceName.trim().toLowerCase()
              );
              const channelMatch = !!(
                cs.videoChannelName &&
                (apt as any).videoChannelName &&
                (apt as any).videoChannelName === cs.videoChannelName
              );
              const notesMatch = !!(apt.notes && cs._id && apt.notes.includes(cs._id.toString()));
              const slotMatch = !!(cs.date && cs.time && apt.date === cs.date && apt.time === cs.time);

              if (nameMatch || channelMatch || notesMatch || slotMatch) {
                if (isTherapyCompleted && ["Scheduled", "Checked In", "Engaged", "Rescheduled"].includes(apt.status)) {
                  toCompleteIds.push((apt as any)._id);
                  (apt as any).status = "Completed";
                }
                if (isTherapyPaid && (apt as any).paymentStatus !== "Paid") {
                  toMarkPaidFromTherapy.push((apt as any)._id);
                  (apt as any).paymentStatus = "Paid";
                  if (!(apt as any).transactionId && cs.transactionId) {
                    (apt as any).transactionId = cs.transactionId;
                  }
                }
              }
            }
          }

          if (toCompleteIds.length > 0) {
            await AppointmentModel.updateMany(
              { _id: { $in: toCompleteIds } },
              { $set: { status: "Completed", updatedBy: "therapy-session-sync" } }
            );
          }
          if (toMarkPaidFromTherapy.length > 0) {
            await AppointmentModel.updateMany(
              { _id: { $in: toMarkPaidFromTherapy } },
              { $set: { paymentStatus: "Paid", updatedBy: "therapy-session-sync" } }
            );
          }
        }
      } catch (syncErr) {
        console.warn("[AppointmentService] Failed to sync therapy/payment status:", syncErr);
      }
    }

    // Backfill feeAmount for old appointments that don't have it stored
    const missingFee = list.filter(apt => !(apt as any).feeAmount && (apt as any).serviceName);
    if (missingFee.length > 0) {
      const serviceNames = [...new Set(missingFee.map(apt => (apt as any).serviceName))];
      const services = await PlatformServiceModel.find({ name: { $in: serviceNames } });
      const priceMap = new Map(services.map(s => [s.name, s.price]));
      for (const apt of missingFee) {
        const price = priceMap.get((apt as any).serviceName);
        if (price) (apt as any).feeAmount = price;
      }
    }

    return list;
  }
}
