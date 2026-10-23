import mongoose, { Schema } from "mongoose";

export interface IServiceablePincode {
  pinCode: string;
  areaName: string;
  deliveryCharge: number;
  estimatedHours: string;
  isActive: boolean;
}

export interface IPharmacyConfig {
  pharmacyName: string;
  licenseNumber: string;
  pharmacistInCharge: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  isActive: boolean;
  allowCOD: boolean;
  taxRatePercent: number; // e.g. 12%
  defaultDeliveryFee: number; // e.g. 50
  freeDeliveryThreshold: number; // e.g. 500
  serviceablePincodes: IServiceablePincode[];
  updatedBy?: string;
}

const ServiceablePincodeSchema = new Schema<IServiceablePincode>({
  pinCode: { type: String, required: true },
  areaName: { type: String, required: true },
  deliveryCharge: { type: Number, default: 50 },
  estimatedHours: { type: String, default: "24-48 Hours" },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const PharmacyConfigSchema = new Schema<IPharmacyConfig>({
  pharmacyName: { type: String, required: true, default: "Kelkar Manas Partner Pharmacy" },
  licenseNumber: { type: String, required: true, default: "MH-AKL-2026-20B-10842" },
  pharmacistInCharge: { type: String, default: "Licensed Pharmacist (Reg. No. MH-PH-49120)" },
  contactPhone: { type: String, default: "+91 94228 61000" },
  contactEmail: { type: String, default: "pharmacy@kelkarmanas.com" },
  address: { type: String, default: "Civil Lines, Near District Hospital, Akola, Maharashtra 444001" },
  isActive: { type: Boolean, default: true },
  allowCOD: { type: Boolean, default: false },
  taxRatePercent: { type: Number, default: 12 },
  defaultDeliveryFee: { type: Number, default: 50 },
  freeDeliveryThreshold: { type: Number, default: 500 },
  serviceablePincodes: {
    type: [ServiceablePincodeSchema],
    default: [
      { pinCode: "444001", areaName: "Akola City / Old City / Gandhi Road", deliveryCharge: 50, estimatedHours: "Same Day (within 12-24 hrs)", isActive: true },
      { pinCode: "444002", areaName: "Civil Lines / Ramdas Peth", deliveryCharge: 50, estimatedHours: "Same Day (within 12-24 hrs)", isActive: true },
      { pinCode: "444003", areaName: "Malkapur / MIDC Phase 1 & 2", deliveryCharge: 50, estimatedHours: "24 to 48 Hours", isActive: true },
      { pinCode: "444004", areaName: "Kaulkhed / Jatharpeth / Umri", deliveryCharge: 50, estimatedHours: "Same Day (within 12-24 hrs)", isActive: true },
      { pinCode: "444005", areaName: "Akola Cantonment / Ratanlal Plot", deliveryCharge: 50, estimatedHours: "24 to 48 Hours", isActive: true },
      { pinCode: "444006", areaName: "Shivaji Nagar / Toshniwal Layout", deliveryCharge: 50, estimatedHours: "Same Day (within 12-24 hrs)", isActive: true },
      { pinCode: "444104", areaName: "Murtizapur Road / Akola Outskirts", deliveryCharge: 70, estimatedHours: "24 to 48 Hours", isActive: true },
    ]
  },
  updatedBy: { type: String },
}, {
  timestamps: true,
  collection: "pharmacy_configs"
});

export const PharmacyConfigModel = mongoose.models.PharmacyConfig || mongoose.model<IPharmacyConfig>("PharmacyConfig", PharmacyConfigSchema);
