import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ProductModel } from "@/modules/pharmacy/schema";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (!body.clinicId || !Array.isArray(body.products) || body.products.length === 0) {
      return NextResponse.json({ success: false, message: "Missing clinicId or valid products array" }, { status: 400 });
    }

    const { clinicId, products } = body;

    // Validate and format products
    const validProducts = [];
    for (const p of products) {
      if (!p.name || p.price === undefined || p.stock === undefined) {
        continue; // Skip invalid rows
      }

      let status = "In Stock";
      if (p.stock === 0) {
        status = "Out of Stock";
      } else if (p.stock <= 15) {
        status = "Low Stock";
      }

      validProducts.push({
        clinicId,
        name: p.name,
        category: p.category,
        price: Number(p.price) || 0,
        stock: Number(p.stock) || 0,
        status,
      });
    }

    if (validProducts.length === 0) {
      return NextResponse.json({ success: false, message: "No valid products found to import" }, { status: 400 });
    }

    // Insert all valid products
    const result = await ProductModel.insertMany(validProducts);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.length} products.`,
      importedCount: result.length,
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to import products." },
      { status: 500 }
    );
  }
}
