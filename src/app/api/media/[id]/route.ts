import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { MediaModel } from "@/modules/system/media";

export const dynamic = 'force-dynamic';


export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const media = await MediaModel.findById(id).exec();
    
    if (!media) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return new NextResponse(media.data, {
      status: 200,
      headers: {
        "Content-Type": media.contentType,
        "Content-Disposition": `inline; filename="${media.filename}"`,
      },
    });
  } catch (error) {
    console.error("Media Fetch Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
