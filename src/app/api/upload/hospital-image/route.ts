import { NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { saveUploadedMedia } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only JPEG, PNG, WebP, and GIF images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 15MB before compression)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size must be under 15MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Automatically optimize and convert to high-efficiency WebP
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    // Generate unique filename
    const hash = crypto.randomBytes(8).toString("hex");
    const sanitizedName = (file.name || "hospital")
      .toLowerCase()
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 20);
    const filename = `${sanitizedName}_${hash}.webp`;

    // Persist to MongoDB Media collection (safe on Vercel / serverless without EROFS errors)
    const { url } = await saveUploadedMedia({
      folder: "hospitals",
      filename,
      buffer: optimizedBuffer,
      contentType: "image/webp",
      isPermanent: true,
    });

    return NextResponse.json({
      success: true,
      message: "Hospital image optimized and converted to WebP successfully.",
      url,
    });
  } catch (error: any) {
    console.error("Hospital image upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed." },
      { status: 500 }
    );
  }
}
