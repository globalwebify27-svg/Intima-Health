import mongoose, { Schema } from "mongoose";

export type NotificationMilestone =
  | "DOCTOR_1D"
  | "DOCTOR_1H"
  | "DOCTOR_10M"
  | "DOCTOR_AT_TIME"
  | "PATIENT_3H"
  | "PATIENT_2H"
  | "PATIENT_1H"
  | "PATIENT_10M"
  | "PATIENT_AT_TIME";

export interface IScheduledNotification {
  appointmentId: Schema.Types.ObjectId;
  recipientType: "DOCTOR" | "THERAPIST" | "PATIENT";
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  milestone: NotificationMilestone;
  scheduledFor: Date;
  status: "Pending" | "Sent" | "Cancelled" | "Failed";
  channels: Array<"Email" | "WhatsApp" | "Push">;
  sentAt?: Date;
  failureReason?: string;
  metadata: {
    appointmentType: "Video" | "Walk-in";
    date: string;
    time: string;
    patientName: string;
    specialistName: string;
    specialistRole: "Doctor" | "Therapist";
    specialization?: string;
    clinicName?: string;
    clinicAddress?: string;
    videoLink?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const ScheduledNotificationSchema = new Schema<IScheduledNotification>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
    recipientType: { type: String, enum: ["DOCTOR", "THERAPIST", "PATIENT"], required: true },
    recipientId: { type: String, required: true, index: true },
    recipientEmail: { type: String },
    recipientPhone: { type: String },
    milestone: {
      type: String,
      enum: [
        "DOCTOR_1D",
        "DOCTOR_1H",
        "DOCTOR_10M",
        "DOCTOR_AT_TIME",
        "PATIENT_3H",
        "PATIENT_2H",
        "PATIENT_1H",
        "PATIENT_10M",
        "PATIENT_AT_TIME",
      ],
      required: true,
    },
    scheduledFor: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["Pending", "Sent", "Cancelled", "Failed"],
      default: "Pending",
      index: true,
    },
    channels: [{ type: String, enum: ["Email", "WhatsApp", "Push"] }],
    sentAt: { type: Date },
    failureReason: { type: String },
    metadata: {
      appointmentType: { type: String, enum: ["Video", "Walk-in"], required: true },
      date: { type: String, required: true },
      time: { type: String, required: true },
      patientName: { type: String, required: true },
      specialistName: { type: String, required: true },
      specialistRole: { type: String, enum: ["Doctor", "Therapist"], required: true },
      specialization: { type: String },
      clinicName: { type: String },
      clinicAddress: { type: String },
      videoLink: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate notifications for the same appointment, recipient, and milestone
ScheduledNotificationSchema.index(
  { appointmentId: 1, recipientType: 1, milestone: 1 },
  { unique: true }
);

ScheduledNotificationSchema.index({ status: 1, scheduledFor: 1 });

export const ScheduledNotificationModel =
  (mongoose.models.ScheduledNotification as mongoose.Model<IScheduledNotification>) ||
  mongoose.model<IScheduledNotification>("ScheduledNotification", ScheduledNotificationSchema);

