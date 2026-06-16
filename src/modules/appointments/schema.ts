import mongoose, { Schema } from "mongoose";

export interface IAppointment {
  patientId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  clinicId?: Schema.Types.ObjectId;
  date: string; // e.g. "2026-06-12"
  time: string; // e.g. "10:00 AM"
  type: "Video" | "In-person";
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const AppointmentSchema = new Schema<IAppointment>({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: false },
  date: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ["Video", "In-person"], required: true },
  status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
  notes: { type: String },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

AppointmentSchema.pre("find", function() {
  this.where({ deletedAt: null });
});

AppointmentSchema.pre("findOne", function() {
  this.where({ deletedAt: null });
});

export const AppointmentModel = mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);
