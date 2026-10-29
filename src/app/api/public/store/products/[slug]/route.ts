import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ProductModel } from "@/modules/store/schema";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;
    const isObjectId = mongoose.isValidObjectId(slug);

    const product = await ProductModel.findOne({
      $or: [
        { slug: slug },
        ...(isObjectId ? [{ _id: slug }] : [])
      ],
      deletedAt: null
    }).lean();

    if (!product) return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    return NextResponse.json(
      { success: true, data: product },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
