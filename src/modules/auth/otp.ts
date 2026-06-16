import mongoose, { Schema } from "mongoose";

export interface IOtp {
  phone: string;
  code: string;
  expiresAt: Date;
}

const OtpSchema = new Schema<IOtp>({
  phone: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 } // auto-expire
}, {
  timestamps: true
});

export const OtpModel = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
