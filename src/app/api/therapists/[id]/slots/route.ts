import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapistModel } from "@/modules/therapists/schema";
import { TherapySessionModel } from "@/modules/pharmacy/schema";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { success: false, message: "Date parameter is required (YYYY-MM-DD)." },
        { status: 400 }
      );
    }

    const therapist = await TherapistModel.findById(id).exec();
    if (!therapist) {
      return NextResponse.json({ success: false, message: "Therapist not found." }, { status: 404 });
    }

    // Determine day of week from dateStr (safe parsing without timezone shift)
    const [year, month, day] = dateStr.split("-").map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dayName = targetDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });

    // Look up therapist availability for that day
    const dayConfig = therapist.availability?.find(
      (a: any) => a.day.toLowerCase() === dayName.toLowerCase()
    );

    if (!dayConfig || !dayConfig.slots || dayConfig.slots.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        day: dayName,
        message: `Therapist has no schedule configured for ${dayName}.`,
      });
    }

    // Find already booked therapy sessions for this therapist on this date
    const bookedSessions = await TherapySessionModel.find({
      therapistId: id,
      date: dateStr,
      status: { $in: ["Scheduled", "Booked", "Paid", "In_Progress"] },
    }).exec();

    const bookedTimes = new Set(bookedSessions.map((s) => s.time?.trim()));

    // Available slots
    const availableSlots = dayConfig.slots
      .filter((slot: any) => !bookedTimes.has(slot.start?.trim()))
      .map((slot: any) => slot.start);

    return NextResponse.json({
      success: true,
      data: availableSlots,
      day: dayName,
      allSlots: dayConfig.slots,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to calculate slots." },
      { status: 500 }
    );
  }
}
