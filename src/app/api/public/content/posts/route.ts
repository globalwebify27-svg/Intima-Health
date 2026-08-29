import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PostModel } from "@/modules/cms/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const posts = await PostModel.find({ status: "Published", deletedAt: null }).populate("categoryId").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: posts });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
