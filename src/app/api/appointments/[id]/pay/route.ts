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
