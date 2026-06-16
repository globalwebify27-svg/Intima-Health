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
