import mongoose from "mongoose";
import { ClinicModel, IClinic } from "./schema";

export class ClinicService {
  static async listClinics() {
    return await ClinicModel.find().lean().exec();
  }

  static async getClinicById(id: string) {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { _id: id }] }
      : { _id: id };
    return await ClinicModel.findOne(query as any).lean().exec();
  }

  static async createClinic(data: Partial<IClinic>) {
    const clinic = new ClinicModel(data);
    return await clinic.save();
  }

  static async updateClinic(id: string, data: Partial<IClinic>) {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { _id: id }] }
      : { _id: id };
    return await ClinicModel.findOneAndUpdate(
      query as any,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  static async deleteClinic(id: string) {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { _id: id }] }
      : { _id: id };
    return await ClinicModel.findOneAndDelete(query as any).exec();
  }
}
