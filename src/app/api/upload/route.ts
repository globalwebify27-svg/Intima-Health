import { NextResponse } from "next/server";
import path from "path";
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

    const folderParam = (formData.get("folder") as string)?.replace(/[^a-zA-Z0-9_-]/g, "") || "content";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isImage = file.type.startsWith("image/");

    if (isImage) {
      if (file.type === "image/svg+xml") {
        const hash = crypto.randomBytes(12).toString("hex");
        const filename = `${hash}.svg`;

        const { url } = await saveUploadedMedia({
          folder: folderParam,
          filename,
          buffer,
          contentType: "image/svg+xml",
          isPermanent: true,
        });

        return NextResponse.json({
          success: true,
          message: "SVG uploaded successfully.",
          url,
        });
      }

      // Automatically optimize and convert to high-efficiency WebP
      const optimizedBuffer = await sharp(buffer)
        .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      const hash = crypto.randomBytes(12).toString("hex");
      const filename = `${hash}.webp`;

      const { url } = await saveUploadedMedia({
        folder: folderParam,
        filename,
        buffer: optimizedBuffer,
        contentType: "image/webp",
        isPermanent: true,
      });

      return NextResponse.json({
        success: true,
        message: "Image optimized and converted to WebP successfully.",
        url,
      });
    }

    // For non-images (e.g. PDF documents)
    const hash = crypto.randomBytes(12).toString("hex");
    const ext = path.extname(file.name || "") || ".bin";
    const filename = `${hash}${ext}`;

    const { url } = await saveUploadedMedia({
      folder: "docs",
      filename,
      buffer,
      contentType: file.type || "application/octet-stream",
      isPermanent: true,
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully.",
      url,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed." },
      { status: 500 }
    );
  }
}
