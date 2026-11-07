import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { NotificationModel } from "@/modules/system/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { AppointmentNotificationService } from "@/modules/notifications/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectDB();

    // Also lazily trigger any due scheduled notifications in background
    AppointmentNotificationService.dispatchDueNotifications().catch(() => {});

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload: any = verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const recipientIds = [
      payload.userId,
      payload.patientId,
      payload.doctorId,
      payload.therapistId,
    ].filter(Boolean);

    const notifications = await NotificationModel.find({
      recipientId: { $in: recipientIds },
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean()
      .exec();

    const unreadCount = await NotificationModel.countDocuments({
      recipientId: { $in: recipientIds },
      read: { $ne: true },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload: any = verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const recipientIds = [
      payload.userId,
      payload.patientId,
      payload.doctorId,
      payload.therapistId,
    ].filter(Boolean);

    if (body.all) {
      await NotificationModel.updateMany(
        { recipientId: { $in: recipientIds }, read: { $ne: true } },
        { $set: { read: true } }
      );
    } else if (body.id) {
      await NotificationModel.updateOne(
        { _id: body.id, recipientId: { $in: recipientIds } },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ success: true, message: "Notifications updated." });
  } catch (error: any) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update notifications" },
      { status: 500 }
    );
  }
}

