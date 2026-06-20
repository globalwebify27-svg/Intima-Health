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
    ).exec();
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
    if (filters.patientId) query.patientId = filters.patientId;
    if (filters.date) query.date = filters.date;
    if (filters.status) query.status = filters.status;
    if (filters.clinicId) query.clinicId = filters.clinicId;
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;

    return await AppointmentModel.find(query)
      .populate("patientId doctorId clinicId")
      .sort({ date: 1, time: 1 })
      .exec();
  }

  static async softDelete(id: string, updatedBy?: string): Promise<IAppointment | null> {
    return await AppointmentModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date(), updatedBy } },
      { new: true }
    ).exec();
  }
}
