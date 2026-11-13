import { AppointmentModel } from "@/modules/appointments/schema";
import "@/modules/clinics/schema";
import "@/modules/doctors/schema";
import "@/modules/patients/schema";
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
    if (filters.patientId) query.patientId = filters.patientId;

    if (filters.appointmentId) {
      query.appointmentId = filters.appointmentId;
    } else if (filters.clinicId && filters.clinicId !== "all") {
      const { DoctorModel } = await import("@/modules/doctors/schema");
      const mongoose = await import("mongoose");

      let clinicObjId: any = filters.clinicId;
      try {
        if (mongoose.Types.ObjectId.isValid(filters.clinicId)) {
          clinicObjId = new mongoose.Types.ObjectId(filters.clinicId);
        }
      } catch {}

      const clinicMatch = { $in: [filters.clinicId, clinicObjId] };

      const [appointments, doctorsInClinic, unassignedDoctors] = await Promise.all([
        AppointmentModel.find({ clinicId: clinicMatch }).select("_id").lean().exec(),
        DoctorModel.find({ clinicId: clinicMatch }).select("_id").lean().exec(),
        DoctorModel.find({ $or: [{ clinicId: null }, { clinicId: { $exists: false } }] }).select("_id").lean().exec(),
      ]);

      const appointmentIds = appointments.map((a: any) => a._id);
      const clinicDoctorIds = doctorsInClinic.map((d: any) => d._id);
      const fallbackDoctorIds = unassignedDoctors.map((d: any) => d._id);
      const allRelevantDoctorIds = Array.from(new Set([...clinicDoctorIds, ...fallbackDoctorIds]));

      // Backfill clinicId on ANY standalone digital prescription missing clinicId
      await ConsultationModel.updateMany(
        { 
          $or: [{ clinicId: null }, { clinicId: { $exists: false } }],
          $and: [
            { prescriptionSummary: { $exists: true } },
            { prescriptionSummary: { $ne: null } },
            { prescriptionSummary: { $ne: "" } },
            { prescriptionSummary: { $ne: "[]" } }
          ]
        } as any,
        { $set: { clinicId: filters.clinicId } }
      ).exec().catch(() => {});

      const orConditions: any[] = [
        { clinicId: clinicMatch },
        { appointmentId: { $in: appointmentIds } },
        // Standalone digital prescriptions without video consultation appointment
        { appointmentId: null },
        { appointmentId: { $exists: false } },
      ];
      if (allRelevantDoctorIds.length > 0) {
        orConditions.push({ doctorId: { $in: allRelevantDoctorIds } });
      }

      query.$or = orConditions;
    } else if (filters.doctorId) {
      const docApts = await AppointmentModel.find({
        doctorId: filters.doctorId,
      }).select("_id").lean().exec();
      const docAptIds = docApts.map(a => a._id);
      query.$or = [
        { doctorId: filters.doctorId },
        { appointmentId: { $in: docAptIds } }
      ];
    }

    const consultations = await ConsultationModel.find(query)
      .populate({ path: "patientId", select: "name phone email" })
      .populate({ path: "doctorId", select: "name specialization clinicId qualifications registrationNumber signature avatar" })
      .populate({
        path: "appointmentId",
        select: "clinicId date time type serviceName feeAmount",
        populate: { path: "clinicId", select: "name address" }
      })
      .populate({ path: "clinicId", select: "name address" })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return consultations as unknown as IConsultation[];
  }
}
