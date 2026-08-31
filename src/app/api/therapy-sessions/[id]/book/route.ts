import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapySessionModel } from "@/modules/pharmacy/schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { date, time } = await request.json();

    if (!date || !time) {
      return NextResponse.json(
        { success: false, message: "Date and time are required." },
        { status: 400 }
      );
    }

    const updated = await TherapySessionModel.findByIdAndUpdate(
      resolvedParams.id,
      {
        date,
        time,
        status: "Booked",
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Therapy session not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Therapy booked successfully.",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to book therapy." },
      { status: 500 }
    );
  }
}
