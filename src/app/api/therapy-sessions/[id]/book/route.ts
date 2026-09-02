import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapySessionModel } from "@/modules/pharmacy/schema";
import { AppointmentModel } from "@/modules/appointments/schema";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { date, time, doctorId } = await request.json();

    if (!date || !time || !doctorId) {
      return NextResponse.json(
        { success: false, message: "Date, time, and doctorId are required." },
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

    // Create an Appointment so it shows up in the Doctor's Dashboard
    const appointment = new AppointmentModel({
      patientId: updated.patientId,
      doctorId: doctorId,
      clinicId: updated.clinicId,
      date,
      time,
      type: "Video",
      status: "Scheduled",
      paymentStatus: "Pending", // Payment endpoint will update this to Paid shortly
      paymentMethod: "Online",
      serviceName: updated.name,
      notes: "Therapy Session",
      feeAmount: updated.price || 0,
    });
    
    await appointment.save();

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
