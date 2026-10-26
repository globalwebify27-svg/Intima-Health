export interface IUser {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "SUPER_ADMIN" | "CLINIC_ADMIN" | "DOCTOR" | "PATIENT" | "SUPPORT_AGENT" | "PHARMACY_STAFF" | "CLINIC_MANAGER" | "THERAPIST";
  clinicId?: string;
  patientId?: string;
  therapistId?: string;
  status: "Active" | "Inactive" | "Pending";
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
