import mongoose from "mongoose";
import { ClinicModel, IClinic } from "./schema";

export class ClinicService {
  static async listClinics() {
    return await ClinicModel.find().sort({ createdAt: -1 }).lean().exec();
  }

  static async getClinicById(id: string) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const byId = await ClinicModel.findById(new mongoose.Types.ObjectId(id)).lean().exec();
      if (byId) return byId;
    }
    return await ClinicModel.findOne({ _id: id } as any).lean().exec();
  }

  static async createClinic(data: Partial<IClinic>) {
    const clinic = new ClinicModel(data);
    return await clinic.save();
  }

  static async updateClinic(id: string, data: Partial<IClinic>) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const updated = await ClinicModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        { $set: data },
        { new: true, runValidators: true }
      ).exec();
      if (updated) return updated;
    }
    return await ClinicModel.findOneAndUpdate(
      { _id: id } as any,
      { $set: data },
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
