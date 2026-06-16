import { ClinicModel, IClinic } from "./schema";

export class ClinicService {
  static async listClinics() {
    return await ClinicModel.find().exec();
  }

  static async getClinicById(id: string) {
    return await ClinicModel.findById(id).exec();
  }

  static async createClinic(data: Partial<IClinic>) {
    const clinic = new ClinicModel(data);
    return await clinic.save();
  }

  static async updateClinic(id: string, data: Partial<IClinic>) {
    return await ClinicModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  static async deleteClinic(id: string) {
    return await ClinicModel.findByIdAndDelete(id).exec();
  }
}
