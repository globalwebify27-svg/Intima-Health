import mongoose from "mongoose";
import { ClinicModel, IClinic } from "./schema";

export class ClinicService {
  private static sanitizeClinic<T extends Record<string, any>>(clinic: T): T {
    if (!clinic) return clinic;
    return {
      ...clinic,
      name: typeof clinic.name === "string" ? clinic.name.trim() : clinic.name,
      city: typeof clinic.city === "string" ? clinic.city.trim() : clinic.city,
      state: typeof clinic.state === "string" ? clinic.state.trim() : clinic.state,
      address: typeof clinic.address === "string" ? clinic.address.trim() : clinic.address,
    };
  }

  static async listClinics() {
    const list = await ClinicModel.find().sort({ createdAt: -1 }).lean().exec();
    return list.map(this.sanitizeClinic);
  }

  static async getClinicById(id: string) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const byId = await ClinicModel.findById(new mongoose.Types.ObjectId(id)).lean().exec();
      if (byId) return this.sanitizeClinic(byId);
    }
    const found = await ClinicModel.findOne({ _id: id } as any).lean().exec();
    return found ? this.sanitizeClinic(found) : null;
  }

  static async createClinic(data: Partial<IClinic>) {
    const sanitized = this.sanitizeClinic({ ...data });
    const clinic = new ClinicModel(sanitized);
    return await clinic.save();
  }

  static async updateClinic(id: string, data: Partial<IClinic>) {
    const sanitized = this.sanitizeClinic({ ...data });
    if (mongoose.Types.ObjectId.isValid(id)) {
      const updated = await ClinicModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        { $set: sanitized },
        { new: true, runValidators: true }
      ).exec();
      if (updated) return updated;
    }
    return await ClinicModel.findOneAndUpdate(
      { _id: id } as any,
      { $set: sanitized },
      { new: true, runValidators: true }
    ).exec();
  }

  static async deleteClinic(id: string) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const deleted = await ClinicModel.findByIdAndDelete(new mongoose.Types.ObjectId(id)).exec();
      if (deleted) return deleted;
    }
    return await ClinicModel.findOneAndDelete({ _id: id } as any).exec();
  }
}
