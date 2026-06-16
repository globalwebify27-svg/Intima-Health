import mongoose, { Schema } from "mongoose";

export interface IPatient {
  name: string;
  email: string;
  phone: string;
  dob?: Date;
  gender?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: "Active" | "Inactive";
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const PatientSchema = new Schema<IPatient>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String },
  allergies: [{ type: String }],
  medicalHistory: { type: String },
  emergencyContactName: { type: String },
  emergencyContactPhone: { type: String },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

PatientSchema.pre("find", function() {
  this.where({ deletedAt: null });
});

PatientSchema.pre("findOne", function() {
  this.where({ deletedAt: null });
});

export const PatientModel = mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);
