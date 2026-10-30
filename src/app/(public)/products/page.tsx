import { connectDB } from "@/db/connect";
import { ProductModel } from "@/modules/pharmacy/schema";
import ProductsClient, { Product } from "./ProductsClient";
import { Metadata } from "next";

export const revalidate = 60; // Incremental Static Regeneration: revalidate every 60s

export const metadata: Metadata = {
  title: "Clinical-Grade Health Products & Medicines | Kelkar Manas Health Care",
  description:
    "Explore our complete range of clinical-grade medications, supplements, and wellness diagnostic kits with discreet delivery.",
};

interface ProductDoc {
  _id?: { toString(): string } | string;
  id?: string;
  slug?: string;
  name: string;
  category?: string;
  price: number;
  mrp?: number;
  image?: string;
  type?: "medication" | "diagnostic" | "supplement";
  description?: string;
  isPrescription?: boolean;
  dosageForm?: string;
  packSize?: string;
  composition?: string;
  stock?: number;
}

export default async function ProductsPage() {
  let initialProducts: Product[] = [];

  try {
    await connectDB();

    const productsDoc = (await ProductModel.find({ deletedAt: null })
      .select("name slug category price mrp image type description isPrescription dosageForm packSize composition stock")
      .lean()) as unknown as ProductDoc[];

    if (productsDoc && productsDoc.length > 0) {
      initialProducts = productsDoc.map((p) => ({
        id: p._id?.toString() || p.id || "",
        _id: p._id?.toString(),
        slug: p.slug || p._id?.toString(),
        name: p.name,
        category: p.category || "Medication",
        price: Number(p.price || 0),
        mrp: p.mrp ? Number(p.mrp) : undefined,
        image: p.image || "/images/product_kit_1.png",
        type: p.type || "medication",
        description: p.description,
        isPrescription: Boolean(p.isPrescription),
        dosageForm: p.dosageForm,
        packSize: p.packSize,
        composition: p.composition,
        stock: p.stock,
      }));
    }
  } catch (error) {
    console.error("Error loading products on server:", error);
  }

  return <ProductsClient initialProducts={initialProducts} />;
}
