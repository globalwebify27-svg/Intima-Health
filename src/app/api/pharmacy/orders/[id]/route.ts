import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { OrderModel } from "@/modules/pharmacy/schema";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const updated = await OrderModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).exec();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update order." },
      { status: 400 }
    );
  }
}
