import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { MediaModel } from "@/modules/system/media";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    let media = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      media = await MediaModel.findById(id).exec();
    }

    if (!media) {
      media = await MediaModel.findOne({
        $or: [
          { filename: id },
          { path: id },
        ],
      }).exec();
    }

    if (!media) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return new NextResponse(media.data, {
      status: 200,
      headers: {
        "Content-Type": media.contentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${media.filename}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Media Fetch Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
