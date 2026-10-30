import { notFound } from "next/navigation";
import { connectDB } from "@/db/connect";
import { ProductModel } from "@/modules/pharmacy/schema";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";
import mongoose from "mongoose";

export const revalidate = 120; // Cache for 2 minutes (Incremental Static Regeneration)

interface ProductItemDoc {
  _id?: { toString(): string } | string;
  slug?: string;
  name?: string;
  category?: string;
  price?: number;
  mrp?: number;
  image?: string;
  type?: "medication" | "diagnostic" | "supplement";
  description?: string;
  isPrescription?: boolean;
  dosageForm?: string;
  packSize?: string;
  composition?: string;
  manufacturer?: string;
  stock?: number;
}

export async function generateStaticParams() {
  try {
    await connectDB();
    const products = (await ProductModel.find({ deletedAt: null })
      .select("slug _id")
      .lean()) as unknown as ProductItemDoc[];
    return products
      .map((p) => ({
        slug: p.slug || p._id?.toString() || "",
      }))
      .filter((p) => Boolean(p.slug));
  } catch {
    return [];
  }
}

async function getProduct(slug: string) {
  try {
    await connectDB();
    const query: { deletedAt: null; $or?: Array<{ slug?: string; _id?: string }>; slug?: string } = {
      deletedAt: null,
    };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query.$or = [{ slug }, { _id: slug }];
    } else {
      query.slug = slug;
    }

    const rawDoc = await ProductModel.findOne(query).lean();
    if (rawDoc) {
      const doc = rawDoc as unknown as ProductItemDoc;
      return {
        ...doc,
        id: doc._id?.toString() || "",
        _id: doc._id?.toString(),
        slug: doc.slug || doc._id?.toString() || "",
        name: doc.name || "",
        category: doc.category || "Medication",
        price: Number(doc.price || 0),
        mrp: doc.mrp ? Number(doc.mrp) : undefined,
      };
    }
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return { title: "Product Not Found | Kelkar Manas Health Care" };
  }

  return {
    title: `${product.name} | Kelkar Manas Health Care`,
    description: product.description || `Buy ${product.name} with discreet delivery.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  // Convert for serialization
  const serializedProduct = JSON.parse(JSON.stringify(product));

  return <ProductDetailClient product={serializedProduct} />;
}
