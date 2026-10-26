import { connectDB } from "@/db/connect";
import { AuditLogModel } from "@/modules/system/schema";

export type AuditAction =
  | "THERAPIST_ASSIGNED"
  | "THERAPIST_REASSIGNED"
  | "THERAPY_MODE_SELECTED"
  | "THERAPY_SLOT_BOOKED"
  | "THERAPY_PAYMENT_COMPLETED"
  | "THERAPY_SESSION_COMPLETED"
  | "CLINICAL_RECORD_ACCESSED"
  | "THERAPIST_CREATED"
  | "THERAPIST_UPDATED"
  | "THERAPIST_DELETED"
  | "REASSIGNMENT_REQUESTED";

interface LogAuditOptions {
  userId?: string;
  action: AuditAction | string;
  details?: string | Record<string, any>;
  ipAddress?: string;
}

export async function logAuditEvent({ userId, action, details, ipAddress }: LogAuditOptions) {
  try {
    await connectDB();
    const detailsString = typeof details === "object" ? JSON.stringify(details) : details;
    await AuditLogModel.create({
      userId,
      action,
      details: detailsString,
      ipAddress,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
