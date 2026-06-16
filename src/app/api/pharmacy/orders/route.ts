import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { OrderModel, ProductModel } from "@/modules/pharmacy/schema";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const patientId = searchParams.get("patientId");

    const query: Record<string, any> = {};
    if (clinicId) query.clinicId = clinicId;
    if (patientId) query.patientId = patientId;

    const orders = await OrderModel.find(query)
      .populate("patientId")
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({
      success: true,
      message: "Orders retrieved successfully.",
      data: orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve orders." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Validate and deduct stock for each product
    if (body.items && Array.isArray(body.items)) {
      for (const item of body.items) {
        const product = await ProductModel.findById(item.productId).exec();
        if (!product) {
          throw new Error("Product not found.");
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }
        
        const newStock = product.stock - item.quantity;
        let newStatus = product.status;
        if (newStock === 0) {
          newStatus = "Out of Stock";
        } else if (newStock <= 15) {
          newStatus = "Low Stock";
        }

        await ProductModel.findByIdAndUpdate(item.productId, {
          $set: { stock: newStock, status: newStatus }
        }).exec();
      }
    }

    const newOrder = new OrderModel(body);
    await newOrder.save();
    return NextResponse.json({
      success: true,
      message: "Order placed successfully and stock updated.",
      data: newOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create order." },
      { status: 400 }
    );
  }
}
