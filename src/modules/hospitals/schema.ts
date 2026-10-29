import mongoose, { Schema } from "mongoose";

export interface IHospital {
  _id?: any;
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  image?: string;
  hidePdf?: boolean;
  shortDescription: string;
  fullAbout: string;
  founderInfo?: string;
  services: string[];
  servicesDisclaimer?: string;
  rtmsIntro?: string;
  rtmsConditions?: string[];
  rtmsBenefits?: string[];
  rtmsSummary?: string;
  requiredDocuments?: {
    title: string;
    list: string[];
    note: string;
  };
  closingWellnessNote?: string;
  whyChooseUs?: string[];
  address: string;
  phones: string[];
  googleMapQuery?: string;
  googleMapEmbed?: string;
  googleMapDirectionUrl?: string;
  cashlessSchemeBadge: string;
  cashlessSchemeDetails: string;
  features: string[];
  status?: "Active" | "Inactive";
  order?: number;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const HospitalSchema = new Schema<IHospital>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    tagline: { type: String, default: "" },
    image: { type: String, default: "" },
    hidePdf: { type: Boolean, default: false },
    shortDescription: { type: String, default: "" },
    fullAbout: { type: String, default: "" },
    founderInfo: { type: String, default: "" },
    services: [{ type: String }],
    servicesDisclaimer: { type: String, default: "" },
    rtmsIntro: { type: String, default: "" },
    rtmsConditions: [{ type: String }],
    rtmsBenefits: [{ type: String }],
    rtmsSummary: { type: String, default: "" },
    requiredDocuments: {
      title: { type: String, default: "" },
      list: [{ type: String }],
      note: { type: String, default: "" },
    },
    closingWellnessNote: { type: String, default: "" },
    whyChooseUs: [{ type: String }],
    address: { type: String, default: "" },
    phones: [{ type: String }],
    googleMapQuery: { type: String, default: "" },
    googleMapEmbed: { type: String, default: "" },
    googleMapDirectionUrl: { type: String, default: "" },
    cashlessSchemeBadge: { type: String, default: "" },
    cashlessSchemeDetails: { type: String, default: "" },
    features: [{ type: String }],
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

HospitalSchema.pre("find", function (this: any) {
  this.where({ deletedAt: null });
});

HospitalSchema.pre("findOne", function (this: any) {
  this.where({ deletedAt: null });
});

if (mongoose.models.Hospital) {
  delete (mongoose.models as any).Hospital;
}

export const HospitalModel =
  mongoose.models.Hospital || mongoose.model<IHospital>("Hospital", HospitalSchema);
