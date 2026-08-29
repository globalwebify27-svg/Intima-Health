import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true }, // Store as smallest currency unit (e.g., paise or cents)
    image: { type: String, required: true },
    type: { type: String, enum: ["medication", "diagnostic", "supplement"], required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    isPrescription: { type: Boolean, default: false },
    stock: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const ProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);
