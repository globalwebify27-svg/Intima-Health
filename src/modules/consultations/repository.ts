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
      { $set: { ...data, updatedAt: new Date() } },
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

      const [doctorsInClinic, unassignedDoctors] = await Promise.all([
        DoctorModel.find({ clinicId: clinicMatch }).select("_id").lean().exec(),
        DoctorModel.find({ $or: [{ clinicId: null }, { clinicId: { $exists: false } }] }).select("_id").lean().exec(),
      ]);

      const clinicDoctorIds = doctorsInClinic.map((d: any) => d._id);
      const fallbackDoctorIds = unassignedDoctors.map((d: any) => d._id);
      const allRelevantDoctorIds = Array.from(new Set([...clinicDoctorIds, ...fallbackDoctorIds]));

      // Find all appointments for this clinic OR assigned to doctors in this clinic
      const appointments = await AppointmentModel.find({
        $or: [
          { clinicId: clinicMatch },
          { doctorId: { $in: allRelevantDoctorIds } }
        ]
      }).select("_id").lean().exec();

      const appointmentIds = appointments.map((a: any) => a._id);

      // Backfill clinicId on ANY standalone digital prescription missing clinicId for this clinic's doctors
      await ConsultationModel.updateMany(
        { 
          $or: [{ clinicId: null }, { clinicId: { $exists: false } }],
          doctorId: { $in: allRelevantDoctorIds },
          prescriptionSummary: { $exists: true, $nin: [null, "", "[]"] }
        } as any,
        { $set: { clinicId: clinicObjId || filters.clinicId } }
      ).exec().catch(() => {});

      const orConditions: any[] = [
        { clinicId: clinicMatch },
        { appointmentId: { $in: appointmentIds } },
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
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean()
      .exec();

    // Attach order information (such as dispense payment method) for fulfilled/dispensed consultations
    if (consultations && consultations.length > 0) {
      try {
        const consultIds = consultations.map((c: any) => c._id);
        const { OrderModel } = await import("@/modules/pharmacy/schema");
        const orders = await OrderModel.find({
          consultationId: { $in: consultIds },
          status: { $nin: ["Cancelled", "CANCELLED"] },
          deletedAt: null
        }).select("consultationId paymentMethod paymentStatus totalAmount orderNumber createdAt").lean().exec();

        const orderMap = new Map<string, any>();
        orders.forEach((o: any) => {
          if (o.consultationId) {
            orderMap.set(String(o.consultationId), o);
          }
        });

        consultations.forEach((c: any) => {
          const ord = orderMap.get(String(c._id));
          if (ord) {
            c.dispensePaymentMethod = ord.paymentMethod || c.dispensePaymentMethod || "Cash";
            c.dispenseOrderNumber = ord.orderNumber;
            c.dispenseTotalAmount = ord.totalAmount;
          }
        });
      } catch (ordErr) {
        console.error("Error populating orders for consultations:", ordErr);
      }
    }

    return consultations as unknown as IConsultation[];
  }
}
