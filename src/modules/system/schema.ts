import mongoose, { Schema } from "mongoose";

// --- AUDIT LOG ---
export interface IAuditLog {
  userId?: string;
  action: string; // e.g. "Login", "Prescription Creation"
  details?: string;
  ipAddress?: string;
  createdAt?: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: String },
  action: { type: String, required: true },
  details: { type: String },
  ipAddress: { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// --- NOTIFICATION ---
export interface INotification {
  recipientId: string;
  recipientType: "PATIENT" | "DOCTOR" | "ADMIN";
  channel: "Email" | "SMS" | "WhatsApp" | "Push";
  title: string;
  message: string;
  status: "Sent" | "Failed" | "Pending";
  createdAt?: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: String, required: true },
  recipientType: { type: String, enum: ["PATIENT", "DOCTOR", "ADMIN"], required: true },
  channel: { type: String, enum: ["Email", "SMS", "WhatsApp", "Push"], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["Sent", "Failed", "Pending"], default: "Pending" },
}, {
  timestamps: { createdAt: true, updatedAt: true },
});

// --- SETTINGS ---
export interface ISetting {
  key: string; // e.g. "clinic_name"
  value: string;
  category: string; // e.g. "general", "billing"
}

const SettingSchema = new Schema<ISetting>({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: String, required: true },
  category: { type: String, required: true, default: "general" },
});

// --- FEATURE FLAGS ---
export interface IFeatureFlag {
  name: string; // e.g. "video_consultations_enabled"
  isEnabled: boolean;
  description?: string;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>({
  name: { type: String, required: true, unique: true, index: true },
  isEnabled: { type: Boolean, required: true, default: false },
  description: { type: String },
});

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export const SettingModel = mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);
export const FeatureFlagModel = mongoose.models.FeatureFlag || mongoose.model<IFeatureFlag>("FeatureFlag", FeatureFlagSchema);
