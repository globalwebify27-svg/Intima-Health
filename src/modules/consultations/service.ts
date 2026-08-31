import { ConsultationRepository } from "./repository";
import { IConsultation } from "./schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { TherapySessionModel } from "@/modules/pharmacy/schema";
import { AppointmentModel } from "@/modules/appointments/schema";
import { sendPrescriptionMessage } from "@/lib/whatsapp";

export class ConsultationService {
  static async createConsultation(data: Partial<IConsultation>, createdBy?: string) {
    return await ConsultationRepository.create({
      ...data,
      videoChannelName: data.videoChannelName || `room-${Math.random().toString(36).substring(2, 9)}`,
      status: "Pending",
      createdBy,
    });
  }

  static async getConsultation(id: string) {
    const consultation = await ConsultationRepository.findById(id);
    if (!consultation) {
      throw new Error("Consultation not found.");
    }
    return consultation;
  }

  static async updateConsultation(id: string, data: Partial<IConsultation>, updatedBy?: string) {
    if (data.status === "Completed") {
      if (!data.notes || data.notes.trim() === "") {
        throw new Error("Clinical notes are mandatory to complete a consultation.");
      }
    }

    const updated = await ConsultationRepository.update(id, {
      ...data,
      updatedBy,
    });

    if (!updated) return updated;

    // --- Sync therapy session records whenever prescribedTherapies is provided ---
    if (data.prescribedTherapies) {
      try {
        // Resolve clinicId from the populated doctor or appointment
        const doctorDoc = updated.doctorId as any;
        const clinicId =
          doctorDoc?.clinicId?._id || doctorDoc?.clinicId ||
          (updated.appointmentId as any)?.clinicId?._id ||
          (updated.appointmentId as any)?.clinicId;

        const patientId = (updated.patientId as any)?._id || updated.patientId;
        const consultationId = (updated as any)._id;

        if (clinicId && patientId) {
          const therapies = JSON.parse(data.prescribedTherapies);
          if (Array.isArray(therapies)) {
            // Remove old "Recommended" sessions for this consultation to avoid duplicates
            await TherapySessionModel.deleteMany({
              consultationId,
              status: "Recommended",
            });

            // Create fresh therapy session records
            for (const therapy of therapies) {
              if (therapy.name && therapy.name.trim() !== "") {
                await TherapySessionModel.create({
                  patientId,
                  clinicId,
                  name: therapy.name,
                  price: Number(therapy.price) || 0,
                  status: "Recommended",
                  consultationId,
                });
              }
            }
          }
        } else {
          console.error("Could not resolve clinicId for therapy sessions. doctorDoc:", doctorDoc?._id, "clinicId:", clinicId);
        }
      } catch (e) {
        console.error("Failed to sync prescribed therapies:", e);
      }
    }

    // --- Completion-specific logic ---
    if (data.status === "Completed") {
      // Update appointment status to Completed
      const aptId = updated.appointmentId;
      if (aptId) {
        await AppointmentModel.findByIdAndUpdate(aptId, { status: "Completed" }).exec();
      }

      // Send digital prescription WhatsApp notification to the patient
      if (updated.prescriptionSummary) {
        await sendPrescriptionMessage((updated as any)._id.toString());
      }
    }

    return updated;
  }

  static async listConsultations(filters: { doctorId?: string; patientId?: string; status?: string; clinicId?: string }) {
    return await ConsultationRepository.list(filters);
  }
}
