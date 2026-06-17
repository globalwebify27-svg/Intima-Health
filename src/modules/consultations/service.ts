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
    const updated = await ConsultationRepository.update(id, {
      ...data,
      updatedBy,
    });

    if (updated && data.status === "Completed") {
      // Update appointment status to Completed
      const aptId = updated.appointmentId;
      if (aptId) {
        await AppointmentModel.findByIdAndUpdate(aptId, { status: "Completed" }).exec();
      }

      const doctor = await DoctorModel.findById(updated.doctorId).exec();
      if (doctor && doctor.clinicId) {
        if (data.prescribedTherapies) {
          try {
            const therapies = JSON.parse(data.prescribedTherapies);
            if (Array.isArray(therapies)) {
              for (const therapy of therapies) {
                const session = new TherapySessionModel({
                  patientId: updated.patientId,
                  clinicId: doctor.clinicId,
                  name: therapy.name,
                  price: Number(therapy.price),
                  status: "Unpaid",
                  consultationId: (updated as any)._id,
                });
                await session.save();
              }
            }
          } catch (e) {
            console.error("Failed to seed prescribed therapies:", e);
          }
        }
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
