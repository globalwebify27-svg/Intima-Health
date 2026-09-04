import { DoctorModel } from "./schema";
import { IDoctor } from "./types";

export class DoctorRepository {
  static async create(data: Partial<IDoctor>): Promise<IDoctor> {
    const doctor = new DoctorModel(data);
    return await doctor.save();
  }

  static async findById(id: string): Promise<IDoctor | null> {
    return await DoctorModel.findById(id).exec();
  }

  static async findByEmail(email: string): Promise<IDoctor | null> {
    return await DoctorModel.findOne({ email }).exec();
  }

  static async update(id: string, data: Partial<IDoctor>): Promise<IDoctor | null> {
    return await DoctorModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  static async softDelete(id: string, updatedBy?: string): Promise<IDoctor | null> {
    return await DoctorModel.findByIdAndUpdate(
      id,
      { $set: { deletedAt: new Date(), updatedBy } },
      { new: true }
    ).exec();
  }

  static async list(filters: {
    specialization?: string;
    status?: string;
    clinicId?: string;
    state?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<{ doctors: IDoctor[]; total: number }> {
    const query: Record<string, any> = { deletedAt: null };

    if (filters.specialization) {
      query.specialization = { $regex: filters.specialization, $options: "i" };
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.state || filters.city) {
      // Lazy load to avoid circular dependency issues
      const { ClinicModel } = require("@/modules/clinics/schema");
      const clinicQuery: Record<string, any> = { status: "Active" };
      if (filters.state) clinicQuery.state = filters.state;
      if (filters.city) clinicQuery.city = filters.city;
      
      const clinics = await ClinicModel.find(clinicQuery).select('_id').exec();
      const clinicIds = clinics.map((c: any) => c._id);
      
      if (filters.clinicId) {
        if (!clinicIds.some((id: any) => id.toString() === filters.clinicId)) {
          return { doctors: [], total: 0 };
        }
        query.clinicId = filters.clinicId;
      } else {
        query.clinicId = { $in: clinicIds };
      }
    } else if (filters.clinicId) {
      query.clinicId = filters.clinicId;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      DoctorModel.find(query).skip(skip).limit(limit).exec(),
      DoctorModel.countDocuments(query).exec(),
    ]);

    return { doctors, total };
  }
}
