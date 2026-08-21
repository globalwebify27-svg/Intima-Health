import { PlatformServiceModel, IPlatformService } from "./schema";

export class PlatformServicesService {
  static async listServices() {
    return await PlatformServiceModel.find({ status: "Active" }).sort({ createdAt: 1 });
  }

  static async createService(data: Partial<IPlatformService>) {
    const service = new PlatformServiceModel(data);
    await service.save();
    return service;
  }
}
