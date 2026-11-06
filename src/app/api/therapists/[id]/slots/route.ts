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

function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes("PM");
  const isAM = clean.includes("AM");

  const numericPart = clean.replace(/\s*(AM|PM)/i, "").trim();
  const parts = numericPart.split(":");
  if (parts.length < 2) return null;

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10) || 0;

  if (isNaN(hours)) return null;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
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

    // Determine day of week from dateStr (support both YYYY-MM-DD and DD-MM-YYYY)
    const rawParts = dateStr.trim().split(/[-/]/).map(Number);
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

    const normYMD = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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

    // Determine if date is in the past or today relative to IST (Asia/Kolkata)
    const istTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const nowIST = new Date(istTimeStr);

    const isPast = (
      nowIST.getFullYear() > year ||
      (nowIST.getFullYear() === year && (nowIST.getMonth() + 1) > month) ||
      (nowIST.getFullYear() === year && (nowIST.getMonth() + 1) === month && nowIST.getDate() > day)
    );

    if (isPast) {
      return NextResponse.json({
        success: true,
        data: [],
        day: dayName,
        message: "Selected date is in the past.",
      });
    }

    const isToday = (
      nowIST.getFullYear() === year &&
      (nowIST.getMonth() + 1) === month &&
      nowIST.getDate() === day
    );

    // Find already booked therapy sessions for this therapist on this date
    const bookedSessions = await TherapySessionModel.find({
      therapistId: id,
      date: { $in: [dateStr, normYMD] },
      status: { $in: ["Scheduled", "Booked", "Paid", "In_Progress"] },
    }).exec();

    // Collect all booked minute offsets for robust comparison
    const bookedMinutes = new Set(
      bookedSessions
        .map((s) => parseTimeToMinutes(s.time))
        .filter((m): m is number => m !== null)
    );

    // Available slots filtered by bookings
    let availableSlots = dayConfig.slots.filter((slot: any) => {
      const slotM = parseTimeToMinutes(slot.start);
      return slotM !== null && !bookedMinutes.has(slotM);
    });

    // If selected date is today, filter out past session slots
    if (isToday) {
      const currentMinutes = nowIST.getHours() * 60 + nowIST.getMinutes();
      availableSlots = availableSlots.filter((slot: any) => {
        const slotMins = parseTimeToMinutes(slot.start);
        return slotMins !== null && slotMins > currentMinutes;
      });
    }

    // Deduplicate and format returned slots with standardized 12-hour AM/PM format
    const seenSlots = new Set<number>();
    const formattedSlots: string[] = [];
    for (const slot of availableSlots) {
      const slotMins = parseTimeToMinutes(slot.start);
      if (slotMins !== null && !seenSlots.has(slotMins)) {
        seenSlots.add(slotMins);
        const hours24 = Math.floor(slotMins / 60);
        const mins = slotMins % 60;
        const period = hours24 >= 12 ? "PM" : "AM";
        const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
        formattedSlots.push(`${String(hours12).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${period}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: formattedSlots,
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
