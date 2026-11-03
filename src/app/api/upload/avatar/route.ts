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

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size must be under 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Automatically optimize and convert avatar to square WebP (800x800)
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    // Generate unique filename
    const hash = crypto.randomBytes(8).toString("hex");
    const filename = `${hash}.webp`;

    // Persist to MongoDB Media collection (safe on Vercel / serverless without EROFS errors)
    const { url } = await saveUploadedMedia({
      folder: "avatars",
      filename,
      buffer: optimizedBuffer,
      contentType: "image/webp",
      isPermanent: true,
    });

    return NextResponse.json({
      success: true,
      message: "Avatar optimized and converted to WebP successfully.",
      url,
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed." },
      { status: 500 }
    );
  }
}
