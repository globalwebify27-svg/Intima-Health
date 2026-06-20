import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ProductModel } from "@/modules/pharmacy/schema";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await ProductModel.findById(id).exec();
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve product." },
      { status: 500 }
    );
  }
}
