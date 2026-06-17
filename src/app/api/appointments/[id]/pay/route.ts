import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { AppointmentModel } from "@/modules/appointments/schema";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const updated = await AppointmentModel.findByIdAndUpdate(
      id,
      { $set: { paymentStatus: "Paid" } },
      { new: true }
    ).exec();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Appointment not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Appointment fee paid successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process payment." },
      { status: 400 }
    );
  }
}
