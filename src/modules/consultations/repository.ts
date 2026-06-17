import { AppointmentModel } from "@/modules/appointments/schema";
import { ConsultationModel, IConsultation } from "./schema";

export class ConsultationRepository {
  static async findById(id: string) {
    return await ConsultationModel.findById(id)
      .populate("patientId")
      .populate("doctorId")
      .populate("appointmentId")
      .exec();
  }

  static async create(data: Partial<IConsultation>) {
    const consultation = new ConsultationModel(data);
    return await consultation.save();
  }

  static async update(id: string, data: Partial<IConsultation>) {
    return await ConsultationModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .populate("patientId")
      .populate("doctorId")
      .populate("appointmentId")
      .exec();
  }

  static async list(filters: { doctorId?: string; patientId?: string; status?: string; clinicId?: string }) {
    // 1. Auto-create consultations for any scheduled appointments that don't have one
    // Note: AppointmentModel pre("find") hook already filters deletedAt: null
    try {
      // Only auto-create consultations for paid appointments
      const aptQuery: any = { status: "Scheduled", paymentStatus: "Paid" };
      if (filters.doctorId) aptQuery.doctorId = filters.doctorId;
      if (filters.patientId) aptQuery.patientId = filters.patientId;
      if (filters.clinicId) aptQuery.clinicId = filters.clinicId;

      const matchingAppointments = await AppointmentModel.find(aptQuery).exec();
      for (const apt of matchingAppointments) {
        const existing = await ConsultationModel.findOne({ appointmentId: apt._id }).exec();
        if (!existing) {
          const newConsultation = new ConsultationModel({
            appointmentId: apt._id,
            patientId: apt.patientId,
            doctorId: apt.doctorId,
            videoChannelName: `room-${Math.random().toString(36).substring(2, 9)}`,
            status: "Pending",
            createdBy: "system"
          });
          await newConsultation.save();
        }
      }
    } catch (err) {
      console.error("Failed to auto-create consultations for scheduled appointments:", err);
    }

    const query: any = {};
    if (filters.doctorId) query.doctorId = filters.doctorId;
    if (filters.patientId) query.patientId = filters.patientId;
    if (filters.status) query.status = filters.status;

    if (filters.clinicId) {
      // Only include appointments where payment has been made
      const appointments = await AppointmentModel.find({ clinicId: filters.clinicId, paymentStatus: "Paid" }).select("_id").exec();
      const appointmentIds = appointments.map(a => a._id);
      query.appointmentId = { $in: appointmentIds };
    } else if (filters.doctorId) {
      // For doctor-specific queries, restrict to paid appointments only
      const paidApts = await AppointmentModel.find({ doctorId: filters.doctorId, paymentStatus: "Paid" }).select("_id").exec();
      const paidAptIds = paidApts.map(a => a._id);
      query.appointmentId = { $in: paidAptIds };
    }

    const consultations = await ConsultationModel.find(query)
      .populate("patientId")
      .populate("doctorId")
      .populate("appointmentId")
      .sort({ createdAt: -1 })
      .exec();

    return consultations;
  }
}
