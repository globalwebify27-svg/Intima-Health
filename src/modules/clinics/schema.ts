import mongoose, { Schema } from "mongoose";

export interface IClinic {
  name: string;
  city: string; // e.g. "Pune", "Mumbai", "Delhi"
  address: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

const ClinicSchema = new Schema<IClinic>({
  name: { type: String, required: true },
  city: { type: String, required: true, index: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, {
  timestamps: true
});

export const ClinicModel = mongoose.models.Clinic || mongoose.model<IClinic>("Clinic", ClinicSchema);

export interface IClinicService {
  clinicId: Schema.Types.ObjectId;
  doctorId?: Schema.Types.ObjectId;
  name: string;
  price: number;
  description?: string;
  status: "Active" | "Inactive";
}

const ClinicServiceSchema = new Schema<IClinicService>({
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: false },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, {
  timestamps: true
});

if (mongoose.models.ClinicService) {
  delete (mongoose.models as any).ClinicService;
}

export const ClinicServiceModel = mongoose.models.ClinicService || mongoose.model<IClinicService>("ClinicService", ClinicServiceSchema);
