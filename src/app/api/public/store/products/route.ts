import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ProductModel } from "@/modules/store/schema";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    await connectDB();
    const products = await ProductModel.find({ deletedAt: null })
      .select("name slug category price mrp image type description isPrescription dosageForm packSize status composition stock")
      .lean();

    return NextResponse.json(
      { success: true, data: products },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
