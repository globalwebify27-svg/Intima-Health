import mongoose, { Schema } from "mongoose";

// --- MEDICAL RECORD ---
export interface IMedicalRecord {
  patientId: Schema.Types.ObjectId;
  recordType: string; // e.g. "Vaccination", "Lab Result", "Doctor Note"
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  recordType: { type: String, required: true },
  notes: { type: String },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// --- PRESCRIPTION ---
export interface IPrescriptionItem {
  medicineName: string;
  dosage: string; // e.g. "50mg"
  frequency: string; // e.g. "Once daily"
  duration: string; // e.g. "30 days"
}

export interface IPrescription {
  consultationId?: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  items: IPrescriptionItem[];
  notes?: string;
  pdfPath?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const PrescriptionItemSchema = new Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
}, { _id: false });

const PrescriptionSchema = new Schema<IPrescription>({
  consultationId: { type: Schema.Types.ObjectId, ref: "Consultation" },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  items: [PrescriptionItemSchema],
  notes: { type: String },
  pdfPath: { type: String },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// --- REPORT ---
export interface IReport {
  patientId: Schema.Types.ObjectId;
  reportName: string;
  filePath: string;
  reportType: string; // e.g. "Blood Test", "MRI"
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const ReportSchema = new Schema<IReport>({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  reportName: { type: String, required: true },
  filePath: { type: String, required: true },
  reportType: { type: String, required: true },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

MedicalRecordSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
MedicalRecordSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

PrescriptionSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
PrescriptionSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

ReportSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
ReportSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

export const MedicalRecordModel = mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>("MedicalRecord", MedicalRecordSchema);
export const PrescriptionModel = mongoose.models.Prescription || mongoose.model<IPrescription>("Prescription", PrescriptionSchema);
export const ReportModel = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
