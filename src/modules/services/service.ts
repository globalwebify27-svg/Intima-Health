import { PlatformServiceModel, IPlatformService } from "./schema";

export class PlatformServicesService {
  static async listServices() {
    return await PlatformServiceModel.find({}).sort({ createdAt: 1 });
  }

  static async createService(data: Partial<IPlatformService>) {
    const service = new PlatformServiceModel(data);
    await service.save();
    return service;
  }

  static async updateService(id: string, data: Partial<IPlatformService>) {
    const service = await PlatformServiceModel.findByIdAndUpdate(id, data, { new: true });
    if (!service) throw new Error("Service not found");
    return service;
  }

  static async deleteService(id: string) {
    const service = await PlatformServiceModel.findByIdAndDelete(id);
    if (!service) throw new Error("Service not found");
    return service;
  }
}
