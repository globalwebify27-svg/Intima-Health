import mongoose, { Schema } from "mongoose";

export interface IConsultation {
  appointmentId?: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  videoChannelName?: string;
  notes?: string;
  prescriptionSummary?: string;
  prescribedTherapies?: string;
  status: "Pending" | "Active" | "Completed";
  prescriptionStatus?: "Pending" | "Fulfilled";
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const ConsultationSchema = new Schema<IConsultation>({
  appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: false },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  videoChannelName: { type: String },
  notes: { type: String },
  prescriptionSummary: { type: String },
  prescribedTherapies: { type: String },
  status: { type: String, enum: ["Pending", "Active", "Completed"], default: "Pending" },
  prescriptionStatus: { type: String, enum: ["Pending", "Fulfilled"], default: "Pending" },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

ConsultationSchema.pre("find", function() {
  this.where({ deletedAt: null });
});

ConsultationSchema.pre("findOne", function() {
  this.where({ deletedAt: null });
});

if (mongoose.models.Consultation) {
  delete (mongoose.models as any).Consultation;
}
export const ConsultationModel = mongoose.model<IConsultation>("Consultation", ConsultationSchema);
