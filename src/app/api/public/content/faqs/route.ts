import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { FaqModel } from "@/modules/cms/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const faqs = await FaqModel.find({ deletedAt: null }).lean();
    return NextResponse.json({ success: true, data: faqs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
