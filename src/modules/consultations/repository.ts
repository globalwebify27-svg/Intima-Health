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
    // 1. Auto-create consultations for any active appointments only if relevant (skip when querying Completed or pure patient view)
    if (filters.status !== "Completed" && (filters.appointmentId || filters.doctorId)) {
      try {
        if (filters.appointmentId) {
          const existing = await ConsultationModel.findOne({ appointmentId: filters.appointmentId as any }).select("_id").lean();
          if (!existing) {
            const specificApt = await AppointmentModel.findById(filters.appointmentId).lean();
            if (specificApt) {
              await ConsultationModel.create({
                appointmentId: specificApt._id,
                patientId: specificApt.patientId,
                doctorId: specificApt.doctorId,
                videoChannelName: `room-${Math.random().toString(36).substring(2, 9)}`,
                status: "Pending",
                createdBy: "system"
              });
            }
          }
        } else if (filters.doctorId) {
          const matchingAppointments = await AppointmentModel.find({
            doctorId: filters.doctorId,
            status: { $in: ["Scheduled", "Checked In", "Engaged"] }
          }).select("_id patientId doctorId").lean();

          if (matchingAppointments.length > 0) {
            const aptIds = matchingAppointments.map(a => a._id);
            const existingConsults = await ConsultationModel.find({ appointmentId: { $in: aptIds } }).select("appointmentId").lean();
            const existingSet = new Set(existingConsults.map(c => String(c.appointmentId)));

            const toCreate = matchingAppointments
              .filter(apt => !existingSet.has(String(apt._id)))
              .map(apt => ({
                appointmentId: apt._id,
                patientId: apt.patientId,
                doctorId: apt.doctorId,
                videoChannelName: `room-${Math.random().toString(36).substring(2, 9)}`,
                status: "Pending" as const,
                createdBy: "system"
              }));

            if (toCreate.length > 0) {
              await ConsultationModel.insertMany(toCreate);
            }
          }
        }
      } catch (err) {
        console.error("Failed to auto-create consultations for appointments:", err);
      }
    }

    const query: any = {};
    if (filters.status) query.status = filters.status;

    if (filters.appointmentId) {
      query.appointmentId = filters.appointmentId;
    } else if (filters.clinicId) {
      const appointments = await AppointmentModel.find({ clinicId: filters.clinicId }).select("_id").lean().exec();
      const appointmentIds = appointments.map(a => a._id);
      query.appointmentId = { $in: appointmentIds };
    } else if (filters.doctorId) {
      const docApts = await AppointmentModel.find({
        doctorId: filters.doctorId,
      }).select("_id").lean().exec();
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
      .populate({ path: "patientId", select: "name phone email" })
      .populate({ path: "doctorId", select: "name specialization clinicId qualifications registrationNumber signature avatar" })
      .populate({
        path: "appointmentId",
        select: "clinicId date time type serviceName feeAmount",
        populate: { path: "clinicId", select: "name address" }
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return consultations as unknown as IConsultation[];
  }
}
