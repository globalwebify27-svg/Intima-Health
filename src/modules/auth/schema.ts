import mongoose, { Schema } from "mongoose";
import { IUser } from "./types";
import crypto from "crypto";

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["SUPER_ADMIN", "CLINIC_ADMIN", "DOCTOR", "PATIENT", "SUPPORT_AGENT", "PHARMACY_STAFF", "CLINIC_MANAGER"], 
    required: true 
  },
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: false },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: false },
  status: { type: String, enum: ["Active", "Inactive", "Pending"], default: "Active" },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// Helper static method to hash a password
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

// Helper static method to verify password
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

UserSchema.pre("find", function() {
  this.where({ deletedAt: null });
});

UserSchema.pre("findOne", function() {
  this.where({ deletedAt: null });
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
