import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ProductModel } from "@/modules/pharmacy/schema";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json({ success: false, message: "clinicId is required" }, { status: 400 });
    }

    let products = await ProductModel.find({ clinicId, deletedAt: null }).exec();

    // Auto-seed if clinic has no products yet
    if (products.length === 0) {
      const defaultProducts = [
        { name: "Paracetamol 500mg", category: "Analgesic", price: 40, stock: 120, status: "In Stock", clinicId },
        { name: "Amoxicillin 250mg", category: "Antibiotic", price: 150, stock: 45, status: "In Stock", clinicId },
        { name: "Cetirizine 10mg", category: "Antihistamine", price: 30, stock: 80, status: "In Stock", clinicId },
        { name: "Ibuprofen 400mg", category: "NSAID", price: 50, stock: 10, status: "Low Stock", clinicId },
        { name: "Cough Syrup 100ml", category: "Antitussive", price: 90, stock: 0, status: "Out of Stock", clinicId },
        { name: "Multivitamin Tablets", category: "Supplements", price: 120, stock: 200, status: "In Stock", clinicId },
      ];
      await ProductModel.insertMany(defaultProducts);
      products = await ProductModel.find({ clinicId, deletedAt: null }).exec();
    }

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve products." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (!body.clinicId || !body.name || !body.category || body.price === undefined || body.stock === undefined) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    let status = "In Stock";
    if (body.stock === 0) {
      status = "Out of Stock";
    } else if (body.stock <= 15) {
      status = "Low Stock";
    }

    const newProduct = new ProductModel({
      ...body,
      status
    });
    await newProduct.save();

    return NextResponse.json({
      success: true,
      message: "Product created successfully.",
      data: newProduct
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create product." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, stock, price, name, category } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
    }

    const updateFields: Record<string, any> = {};
    if (name !== undefined) updateFields.name = name;
    if (category !== undefined) updateFields.category = category;
    if (price !== undefined) updateFields.price = price;
    
    if (stock !== undefined) {
      updateFields.stock = stock;
      if (stock === 0) {
        updateFields.status = "Out of Stock";
      } else if (stock <= 15) {
        updateFields.status = "Low Stock";
      } else {
        updateFields.status = "In Stock";
      }
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).exec();

    if (!updatedProduct) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      data: updatedProduct
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update product." },
      { status: 500 }
    );
  }
}

