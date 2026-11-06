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

    // Validate that slot is not in the past (support YYYY-MM-DD and DD-MM-YYYY)
    const istTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const nowIST = new Date(istTimeStr);
    const rawParts = date.trim().split(/[-/]/).map(Number);
    let year: number;
    let month: number;
    let day: number;

    if (rawParts[0] > 1000) {
      year = rawParts[0];
      month = rawParts[1];
      day = rawParts[2];
    } else {
      day = rawParts[0];
      month = rawParts[1];
      year = rawParts[2];
    }

    const normDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isPastDate = (
      nowIST.getFullYear() > year ||
      (nowIST.getFullYear() === year && (nowIST.getMonth() + 1) > month) ||
      (nowIST.getFullYear() === year && (nowIST.getMonth() + 1) === month && nowIST.getDate() > day)
    );

    if (isPastDate) {
      return NextResponse.json(
        { success: false, message: "Cannot schedule a therapy session for a date in the past." },
        { status: 400 }
      );
    }

    const isToday = (
      nowIST.getFullYear() === year &&
      (nowIST.getMonth() + 1) === month &&
      nowIST.getDate() === day
    );

    if (isToday) {
      const cleanTime = time.trim().toUpperCase();
      const isPM = cleanTime.includes("PM");
      const isAM = cleanTime.includes("AM");
      const numPart = cleanTime.replace(/\s*(AM|PM)/i, "").trim();
      const parts = numPart.split(":");
      let hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10) || 0;
      if (!isNaN(hours)) {
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        const slotMins = hours * 60 + minutes;
        const currentMins = nowIST.getHours() * 60 + nowIST.getMinutes();
        if (slotMins <= currentMins) {
          return NextResponse.json(
            { success: false, message: "This session time slot has already passed. Please select an upcoming slot." },
            { status: 400 }
          );
        }
      }
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

    session.date = normDate;
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
      const docIdToUse = session.doctorId || session.therapistId;
      const appointment = new AppointmentModel({
        patientId: session.patientId,
        doctorId: docIdToUse,
        clinicId: session.clinicId,
        date: normDate,
        time,
        type: selectedMode === "Online" ? "Video" : "Walk-in",
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
