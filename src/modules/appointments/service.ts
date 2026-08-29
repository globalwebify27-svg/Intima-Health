import { AppointmentRepository } from "./repository";
import { DoctorRepository } from "@/modules/doctors/repository";
import { IAppointment } from "./schema";
import { ISlot, IBookAppointmentInput, IRescheduleInput } from "./types";
import { BookAppointmentSchema, RescheduleAppointmentSchema } from "./validators";
import { sendAppointmentBookingMessage } from "@/lib/whatsapp";

export class AppointmentService {
  // Helper to split availability blocks into custom-min slots
  private static generateTimeSlots(startStr: string, endStr: string, slotDuration = 30): string[] {
    const slots: string[] = [];
    let [currHour, currMin] = startStr.split(":").map(Number);
    const [endHour, endMin] = endStr.split(":").map(Number);

    const endTotalMinutes = endHour * 60 + endMin;

    while (currHour * 60 + currMin < endTotalMinutes) {
      const formattedHour = String(currHour).padStart(2, "0");
      const formattedMin = String(currMin).padStart(2, "0");
      slots.push(`${formattedHour}:${formattedMin}`);

      currMin += slotDuration;
      if (currMin >= 60) {
        currHour += Math.floor(currMin / 60);
        currMin = currMin % 60;
      }
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
    const potentialStartTimes: string[] = [];
    for (const block of dayAvail.slots) {
      const blocks = this.generateTimeSlots(block.start, block.end, duration);
      potentialStartTimes.push(...blocks);
    }

    // Get active bookings
    const bookings = await AppointmentRepository.findBookedAppointments(doctorId, dateStr);
    const bookedTimes = new Set(bookings.map(b => {
      const t = b.time.trim();
      if (t.includes(" AM") || t.includes(" PM") || t.includes(" am") || t.includes(" pm")) {
        const [timePart, modifier] = t.split(/\s+/);
        let [hours, minutes] = timePart.split(":");
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
    let slots = potentialStartTimes.map(time => {
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
      createdBy,
    });

    // Send WhatsApp notification (contains appointment details and payment link)
    if (!input.skipNotification) {
      await sendAppointmentBookingMessage((created as any)._id.toString());
    }

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
      for (const apt of expiredAppointments) {
        await AppointmentRepository.update((apt as any)._id as string, {
          status: "Cancelled",
          updatedBy: "system"
        });
        apt.status = "Cancelled";
      }
    }

    return list;
  }
}
