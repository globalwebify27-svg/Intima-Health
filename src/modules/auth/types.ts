export interface IUser {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "SUPER_ADMIN" | "CLINIC_ADMIN" | "DOCTOR" | "PATIENT" | "SUPPORT_AGENT" | "PHARMACY_STAFF" | "CLINIC_MANAGER";
  clinicId?: string;
  patientId?: string;
  status: "Active" | "Inactive" | "Pending";
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
