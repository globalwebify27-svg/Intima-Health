import mongoose, { Schema } from "mongoose";

// --- PAGE ---
export interface IPage {
  title: string;
  slug: string; // unique URL path
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const PageSchema = new Schema<IPage>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  content: { type: String, required: true },
  seoTitle: { type: String },
  seoDescription: { type: String },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// --- POST (BLOG) ---
export interface IPost {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  readTime?: string;
  categoryId?: Schema.Types.ObjectId;
  author: string;
  status: "Draft" | "Published";
  seoTitle?: string;
  seoDescription?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const PostSchema = new Schema<IPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  readTime: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  author: { type: String, required: true },
  status: { type: String, enum: ["Draft", "Published"], default: "Draft" },
  seoTitle: { type: String },
  seoDescription: { type: String },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// --- CATEGORY ---
export interface ICategory {
  name: string;
  slug: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// --- FAQ ---
export interface IFaq {
  question: string;
  answer: string;
  category?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const FaqSchema = new Schema<IFaq>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: "General" },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

PageSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
PageSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

PostSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
PostSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

CategorySchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
CategorySchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

FaqSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
FaqSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

export const PageModel = mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);
export const PostModel = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
export const FaqModel = mongoose.models.Faq || mongoose.model<IFaq>("Faq", FaqSchema);

// --- TREATMENT / CONDITION ---
export interface ITreatment {
  title: string;
  slug: string;
  type?: "treatment" | "sexual-problem";
  badge: string;
  doctor: string;
  leadDoctorRole: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage?: string;
  description: string;
  causes: {
    icon: string;
    title: string;
    description?: string;
    points?: string[];
  }[];
  treatments: {
    title: string;
    description: string;
  }[];
  cta?: {
    headline: string;
    subtext: string;
    buttonText: string;
  };
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const TreatmentSchema = new Schema<ITreatment>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ["treatment", "sexual-problem"], default: "treatment" },
  badge: { type: String },
  doctor: { type: String },
  leadDoctorRole: { type: String },
  heroHeadline: { type: String },
  heroSubtext: { type: String },
  heroImage: { type: String },
  description: { type: String },
  causes: [{
    icon: { type: String },
    title: { type: String },
    description: { type: String },
    points: [{ type: String }]
  }],
  treatments: [{
    title: { type: String },
    description: { type: String }
  }],
  cta: {
    headline: { type: String },
    subtext: { type: String },
    buttonText: { type: String }
  },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

TreatmentSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
TreatmentSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

export const TreatmentModel = mongoose.models.Treatment || mongoose.model<ITreatment>("Treatment", TreatmentSchema);
