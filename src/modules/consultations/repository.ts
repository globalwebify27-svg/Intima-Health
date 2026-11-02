import { AppointmentModel } from "@/modules/appointments/schema";
import { ConsultationModel, IConsultation } from "./schema";

export class ConsultationRepository {
  static async findById(id: string) {
    return await ConsultationModel.findById(id)
      .populate("patientId")
      .populate("doctorId")
      .populate({
        path: "appointmentId",
        populate: { path: "clinicId" }
      })
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
      .populate({
        path: "appointmentId",
        populate: { path: "clinicId" }
      })
      .exec();
  }

  static async list(filters: { doctorId?: string; patientId?: string; status?: string; clinicId?: string; appointmentId?: string }) {
    // 1. Auto-create consultations for any active appointments that don't have one
    // Note: AppointmentModel pre("find") hook already filters deletedAt: null
    try {
      if (filters.appointmentId) {
        // Explicitly ensure consultation exists for the target appointment
        const specificApt = await AppointmentModel.findById(filters.appointmentId).exec();
        if (specificApt) {
          const existing = await ConsultationModel.findOne({ appointmentId: specificApt._id }).exec();
          if (!existing) {
            const newConsultation = new ConsultationModel({
              appointmentId: specificApt._id,
              patientId: specificApt.patientId,
              doctorId: specificApt.doctorId,
              videoChannelName: `room-${Math.random().toString(36).substring(2, 9)}`,
              status: "Pending",
              createdBy: "system"
            });
            await newConsultation.save();
          }
        }
      }

      // Auto-create consultations for all active appointments (Walk-in and Video)
      const aptQuery: any = {
        status: { $in: ["Scheduled", "Checked In", "Engaged"] }
      };
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
      console.error("Failed to auto-create consultations for appointments:", err);
    }

    const query: any = {};
    if (filters.status) query.status = filters.status;

    if (filters.appointmentId) {
      query.appointmentId = filters.appointmentId;
    } else if (filters.clinicId) {
      const appointments = await AppointmentModel.find({ clinicId: filters.clinicId }).select("_id").exec();
      const appointmentIds = appointments.map(a => a._id);
      query.appointmentId = { $in: appointmentIds };
    } else if (filters.doctorId) {
      // Include all doctor appointments (Walk-in and Video)
      const docApts = await AppointmentModel.find({
        doctorId: filters.doctorId,
      }).select("_id").exec();
      const docAptIds = docApts.map(a => a._id);
      query.$or = [
        { appointmentId: { $in: docAptIds } },
        { appointmentId: { $exists: false } },
        { appointmentId: null }
      ];
    } else if (filters.patientId) {
      query.patientId = filters.patientId;
    }

    const consultations = await ConsultationModel.find(query)
      .populate("patientId")
      .populate("doctorId")
      .populate({
        path: "appointmentId",
        populate: { path: "clinicId" }
      })
      .sort({ createdAt: -1 })
      .exec();

    return consultations;
  }
}
