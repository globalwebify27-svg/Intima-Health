import mongoose, { Schema } from "mongoose";
import { IDoctor } from "./types";

const TimeSlotSchema = new Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
}, { _id: false });

const DayAvailabilitySchema = new Schema({
  day: { type: String, required: true },
  slots: [TimeSlotSchema],
}, { _id: false });

const DoctorSchema = new Schema<IDoctor>({
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: false },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true },
  avatar: { type: String },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  bio: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  fees: { type: Number, required: true },
  qualifications: [{ type: String }],
  availability: [DayAvailabilitySchema],
  slotDuration: { type: Number, default: 30 },
  status: { type: String, enum: ["Active", "Inactive", "Pending"], default: "Pending" },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// Soft delete query helper
DoctorSchema.pre("find", function() {
  this.where({ deletedAt: null });
});

DoctorSchema.pre("findOne", function() {
  this.where({ deletedAt: null });
});

export const DoctorModel = mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);
