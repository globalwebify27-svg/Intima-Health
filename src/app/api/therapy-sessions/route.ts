import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapySessionModel } from "@/modules/pharmacy/schema";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const clinicId = searchParams.get("clinicId");

    const query: Record<string, any> = {};
    if (patientId) query.patientId = patientId;
    if (clinicId) query.clinicId = clinicId;

    const sessions = await TherapySessionModel.find(query)
      .populate("patientId")
      .populate("clinicId")
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({
      success: true,
      message: "Therapy sessions retrieved successfully.",
      data: sessions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve therapy sessions." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    if (body.action === "pay" && body.sessionId) {
      const updated = await TherapySessionModel.findByIdAndUpdate(
        body.sessionId,
        { $set: { status: "Paid" } },
        { new: true }
      ).exec();
      return NextResponse.json({
        success: true,
        message: "Therapy session paid successfully.",
        data: updated,
      });
    }

    const newSession = new TherapySessionModel(body);
    await newSession.save();
    return NextResponse.json({
      success: true,
      message: "Therapy session created successfully.",
      data: newSession,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process request." },
      { status: 400 }
    );
  }
}
