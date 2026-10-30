import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isImage = file.type.startsWith("image/");

    if (isImage) {
      // Automatically optimize and convert to high-efficiency WebP
      const optimizedBuffer = await sharp(buffer)
        .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();

      const hash = crypto.randomBytes(12).toString("hex");
      const filename = `${hash}.webp`;

      const uploadDir = path.join(process.cwd(), "public", "uploads", "content");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), optimizedBuffer);

      return NextResponse.json({
        success: true,
        message: "Image optimized and converted to WebP successfully.",
        url: `/uploads/content/${filename}`,
      });
    }

    // For non-images (e.g. PDF documents)
    const hash = crypto.randomBytes(12).toString("hex");
    const ext = path.extname(file.name || "") || ".bin";
    const filename = `${hash}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "docs");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully.",
      url: `/uploads/docs/${filename}`,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed." },
      { status: 500 }
    );
  }
}
