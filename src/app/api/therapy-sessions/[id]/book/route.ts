import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapySessionModel } from "@/modules/pharmacy/schema";
import { AppointmentModel } from "@/modules/appointments/schema";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handleBooking(req: Request, id: string) {
  try {
    await connectDB();
    const body = await req.json();
    const { date, time, selectedMode = "Online", transactionId, paymentMethod = "Online" } = body;

    if (!date || !time) {
      return NextResponse.json(
        { success: false, message: "Date and time slot are required to book therapy." },
        { status: 400 }
      );
    }

    const session = await TherapySessionModel.findById(id).exec();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Therapy session record not found." },
        { status: 404 }
      );
    }

    // Generate unique video channel if online session
    const videoChannelName = selectedMode === "Online"
      ? (session.videoChannelName || `therapy_${session._id}_${Date.now().toString(36)}`)
      : undefined;

    session.date = date;
    session.time = time;
    session.selectedMode = selectedMode;
    session.status = "Scheduled";
    session.paymentStatus = "Paid";
    session.paymentMethod = paymentMethod;
    session.transactionId = transactionId || `TXN-${Date.now()}`;
    if (videoChannelName) {
      session.videoChannelName = videoChannelName;
    }

    await session.save();

    // Create synchronized Appointment record
    try {
      const appointment = new AppointmentModel({
        patientId: session.patientId,
        doctorId: session.doctorId,
        clinicId: session.clinicId,
        date,
        time,
        type: selectedMode === "Online" ? "Video" : "In-Person",
        status: "Scheduled",
        paymentStatus: "Paid",
        paymentMethod,
        transactionId: session.transactionId,
        serviceName: session.name,
        notes: `Assigned Therapy Session (${session.name}) - Mode: ${selectedMode}`,
        feeAmount: session.price || 0,
        videoChannelName,
      });
      await appointment.save();
    } catch (aptErr) {
      console.warn("Non-critical appointment mirror warning:", aptErr);
    }

    // Audit Logging
    await logAuditEvent({
      userId: session.patientId?.toString(),
      action: "THERAPY_MODE_SELECTED",
      details: { sessionId: id, selectedMode },
    });

    await logAuditEvent({
      userId: session.patientId?.toString(),
      action: "THERAPY_SLOT_BOOKED",
      details: { sessionId: id, therapistId: session.therapistId, date, time, selectedMode },
    });

    await logAuditEvent({
      userId: session.patientId?.toString(),
      action: "THERAPY_PAYMENT_COMPLETED",
      details: { sessionId: id, amount: session.price, transactionId: session.transactionId },
    });

    return NextResponse.json({
      success: true,
      message: `Therapy session successfully confirmed for ${date} at ${time} (${selectedMode}).`,
      data: session,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to complete therapy booking." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const { id } = await params;
  return handleBooking(req, id);
}

export async function POST(req: Request, { params }: RouteParams) {
  const { id } = await params;
  return handleBooking(req, id);
}
