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
