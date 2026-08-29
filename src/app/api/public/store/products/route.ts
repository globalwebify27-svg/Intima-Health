import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ProductModel } from "@/modules/store/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const products = await ProductModel.find({ deletedAt: null }).lean();
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
