import mongoose, { Schema } from "mongoose";
import { ITherapist } from "./types";

const TimeSlotSchema = new Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
}, { _id: false });

const DayAvailabilitySchema = new Schema({
  day: { type: String, required: true },
  slots: [TimeSlotSchema],
}, { _id: false });

const TherapistSchema = new Schema<ITherapist>({
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: false },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true },
  avatar: { type: String },
  specialization: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  qualifications: [{ type: String }],
  experience: { type: Number, default: 0 },
  bio: { type: String },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  fees: { type: Number, default: 1500 },
  slotDuration: { type: Number, default: 50 },
  availability: [DayAvailabilitySchema],
  status: { type: String, enum: ["Active", "Inactive", "Pending"], default: "Active" },
  showOnHomepage: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// Soft delete query hooks
TherapistSchema.pre("find", function() {
  this.where({ deletedAt: null });
});

TherapistSchema.pre("findOne", function() {
  this.where({ deletedAt: null });
});

// Fix for Next.js HMR
delete (mongoose.models as any).Therapist;
export const TherapistModel = mongoose.models.Therapist || mongoose.model<ITherapist>("Therapist", TherapistSchema);
