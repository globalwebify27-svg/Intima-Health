import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PageModel } from "@/modules/cms/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const page = await PageModel.findOne({ slug: (await params).slug, deletedAt: null }).lean();
    if (!page) {
      return NextResponse.json({ success: false, message: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
