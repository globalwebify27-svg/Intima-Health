import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PostModel } from "@/modules/cms/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const slug = (await params).slug;
    
    // Find the post by slug and ensure it's published
    const post = await PostModel.findOne({ slug, status: "Published" })
      .populate("categoryId")
      .lean();
      
    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }
      
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
