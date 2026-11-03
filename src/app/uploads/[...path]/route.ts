import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { MediaModel } from "@/modules/system/media";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

interface RouteProps {
  params: Promise<{ path: string[] }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const relativePath = segments.join("/");
    const filename = segments[segments.length - 1];
    const folder = segments.slice(0, segments.length - 1).join("/");

    // 1. Try finding in MongoDB (works on Vercel and serverless)
    await connectDB();
    const media = await MediaModel.findOne({
      $or: [
        { path: relativePath },
        { folder, filename },
        { filename },
      ],
    }).lean();

    if (media && media.data) {
      const buffer = Buffer.isBuffer(media.data)
        ? media.data
        : Buffer.from((media.data as any).buffer || media.data);

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": media.contentType || "image/webp",
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // 2. Fallback to physical disk (for files checked into public/uploads/)
    try {
      const localFilePath = path.join(process.cwd(), "public", "uploads", relativePath);
      const fileBuffer = await readFile(localFilePath);
      const ext = path.extname(filename).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".webp": "image/webp",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".gif": "image/gif",
        ".pdf": "application/pdf",
      };

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": mimeMap[ext] || "application/octet-stream",
          "Content-Length": fileBuffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Not on disk either
    }

    return new NextResponse("File Not Found", { status: 404 });
  } catch (error) {
    console.error("Error serving uploaded media:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

