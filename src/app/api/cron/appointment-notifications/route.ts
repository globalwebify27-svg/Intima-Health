import { NextResponse } from "next/server";
import { AppointmentNotificationService } from "@/modules/notifications/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const shouldBackfill = url.searchParams.get("backfill") === "true";

    let backfilledCount = 0;
    if (shouldBackfill) {
      backfilledCount = await AppointmentNotificationService.backfillUpcomingAppointments();
    }

    const result = await AppointmentNotificationService.dispatchDueNotifications();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      backfilled: shouldBackfill ? backfilledCount : undefined,
      ...result,
    });
  } catch (error: any) {
    console.error("[Cron] Appointment notification error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to dispatch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
