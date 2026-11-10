import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { AppointmentModel } from "@/modules/appointments/schema";
import { getAuthToken, verifyJwt } from "@/lib/jwt";

export const dynamic = 'force-dynamic';


interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const ALLOWED_STAFF_ROLES = new Set(["CLINIC_MANAGER", "ADMIN", "CLINIC_ADMIN", "SUPER_ADMIN", "DOCTOR"]);

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const token = await getAuthToken(request);
    const payload = token ? verifyJwt(token) : null;
    if (!payload || !ALLOWED_STAFF_ROLES.has(payload.role as string)) {
      return NextResponse.json(
        { success: false, message: "Direct payment confirmation is restricted to authorized clinic staff. Please use the online payment gateway." },
        { status: 403 }
      );
    }

    await connectDB();
    const { id } = await params;

    let amount = undefined;
    let transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    let paymentMethod = "Online";
    let collectedBy = "System";

    try {
      const body = await request.json();
      if (body) {
        if (body.amount !== undefined) amount = body.amount;
        if (body.transactionId) transactionId = body.transactionId;
        if (body.paymentMethod) paymentMethod = body.paymentMethod;
        if (body.collectedBy) collectedBy = body.collectedBy;
      }
    } catch (e) {
      // Body might be empty, ignore
    }

    const updateData: any = { 
      paymentStatus: "Paid",
      transactionId,
      paymentMethod,
      collectedBy
    };
    if (amount !== undefined) {
      updateData.feeAmount = amount;
    }

    const updated = await AppointmentModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Appointment not found." }, { status: 404 });
    }

    // Sync any corresponding TherapySession so prepaid status matches everywhere
    if (updated.patientId && updated.date && updated.time) {
      const { TherapySessionModel } = await import("@/modules/pharmacy/schema");
      await TherapySessionModel.updateMany(
        {
          patientId: updated.patientId,
          date: updated.date,
          time: updated.time,
          ...(updated.serviceName ? { name: updated.serviceName } : {}),
        },
        {
          $set: {
            paymentStatus: "Paid",
            paymentMethod,
            transactionId,
          },
        }
      );
    }

    // Send WhatsApp notification for confirmed paid booking
    const { sendAppointmentBookingMessage } = await import("@/lib/whatsapp");
    await sendAppointmentBookingMessage(id, true);

    // Fetch the whatsapp message sent
    let whatsappMessage = "";
    try {
      const { NotificationModel } = await import("@/modules/system/schema");
      const lastNotification = await NotificationModel.findOne({
        recipientId: updated.patientId.toString(),
        title: "Appointment Booking & Payment Link"
      }).sort({ createdAt: -1 }).exec();
      if (lastNotification) {
        whatsappMessage = lastNotification.message;
      }
    } catch (err) {
      console.error("Failed to fetch whatsapp message log:", err);
    }

    return NextResponse.json({
      success: true,
      message: "Appointment fee paid successfully.",
      whatsappMessage,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process payment." },
      { status: 400 }
    );
  }
}
