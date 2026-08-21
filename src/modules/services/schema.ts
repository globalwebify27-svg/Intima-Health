import mongoose, { Schema } from "mongoose";

export interface IPlatformService {
  name: string;
  description: string;
  price: number;
  icon: string;
  type: "Consultation" | "Therapy";
  status: "Active" | "Inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const PlatformServiceSchema = new Schema<IPlatformService>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  icon: { type: String, required: true },
  type: { type: String, enum: ["Consultation", "Therapy"], required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, {
  timestamps: true
});

export const PlatformServiceModel = mongoose.models.PlatformService || mongoose.model<IPlatformService>("PlatformService", PlatformServiceSchema);
