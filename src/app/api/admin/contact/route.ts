import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ContactSubmissionModel } from "@/modules/contact/schema";

export async function GET(req: Request) {
  try {
    await connectDB();
    const submissions = await ContactSubmissionModel.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: submissions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const updated = await ContactSubmissionModel.findByIdAndUpdate(id, { status }, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
