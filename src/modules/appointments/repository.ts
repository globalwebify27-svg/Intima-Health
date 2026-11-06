import { AppointmentModel } from "./schema";
import { IAppointment } from "./schema";

export class AppointmentRepository {
  static async create(data: Partial<IAppointment>): Promise<IAppointment> {
    const apt = new AppointmentModel(data);
    return await apt.save();
  }

  static async findById(id: string): Promise<IAppointment | null> {
    return await AppointmentModel.findById(id).populate("patientId doctorId").exec();
  }

  static async update(id: string, data: Partial<IAppointment>): Promise<IAppointment | null> {
    return await AppointmentModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate("patientId doctorId clinicId").exec();
  }

  static async findBookedAppointments(doctorId: string, date: string): Promise<IAppointment[]> {
    const allDocAppointments = await AppointmentModel.find({
      doctorId,
      status: { $ne: "Cancelled" },
      deletedAt: null,
    }).exec();

    const targetDateNormalized = date.split("T")[0];
    return allDocAppointments.filter(apt => {
      const aptDateNormalized = apt.date.split("T")[0];
      return aptDateNormalized === targetDateNormalized;
    });
  }

  static async list(filters: {
    doctorId?: string;
    patientId?: string;
    date?: string;
    status?: string;
    clinicId?: string;
    paymentStatus?: string;
  }): Promise<IAppointment[]> {
    const query: Record<string, any> = { deletedAt: null };

    if (filters.doctorId) query.doctorId = filters.doctorId;
    if (filters.patientId) {
      try {
        const { PatientModel } = await import("@/modules/patients/schema");
        const mongoose = await import("mongoose");
        const currentPatient = await PatientModel.findById(filters.patientId).lean().exec();
        if (currentPatient) {
          const conditions: any[] = [{ _id: currentPatient._id }];
          if (currentPatient.phone) {
            const last10 = currentPatient.phone.replace(/\D/g, "").slice(-10);
            if (last10) {
              conditions.push({ phone: new RegExp(last10 + "$") });
            }
          }
          if (currentPatient.email && !currentPatient.email.includes("@noemail-intima.com")) {
            conditions.push({ email: currentPatient.email.toLowerCase() });
          }
          const matchingPatients = await PatientModel.find({ $or: conditions }).select("_id").lean().exec();
          const patientIds = matchingPatients.map((p: any) => p._id);
          query.patientId = { $in: patientIds };
        } else {
          query.patientId = mongoose.default.Types.ObjectId.isValid(filters.patientId)
            ? new mongoose.default.Types.ObjectId(filters.patientId)
            : filters.patientId;
        }
      } catch {
        query.patientId = filters.patientId;
      }
    }
    if (filters.date) query.date = filters.date;
    if (filters.status) query.status = filters.status;
    if (filters.clinicId) query.clinicId = filters.clinicId;
    if (filters.paymentStatus && filters.paymentStatus !== "all") query.paymentStatus = filters.paymentStatus;

    return await AppointmentModel.find(query)
      .populate({ path: "doctorId", select: "name specialization clinicId consultationFee" })
      .populate({ path: "patientId", select: "name phone email" })
      .populate({ path: "clinicId", select: "name address" })
      .sort({ date: -1, time: -1 })
      .lean()
      .exec() as unknown as IAppointment[];
  }

  static async softDelete(id: string, updatedBy?: string): Promise<IAppointment | null> {
    return await AppointmentModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date(), updatedBy } },
      { new: true }
    ).exec();
  }
}
