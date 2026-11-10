import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PaymentModel, OrderModel } from "@/modules/pharmacy/schema";
import { AppointmentModel } from "@/modules/appointments/schema";
import { fetchHdfcOrderStatus, isHdfcConfigured } from "@/lib/payments/hdfc-smartgateway";
import { reconcileHdfcPayment } from "@/lib/payments/reconcile";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId is required." }, { status: 400 });
    }

    let payment = await PaymentModel.findOne({
      $or: [{ gatewayOrderId: orderId }, { gatewayTransactionId: orderId }],
    }).exec();

    if (!payment) {
      return NextResponse.json({ success: false, error: "Payment record not found." }, { status: 404 });
    }

    // If still pending and HDFC is configured, actively check HDFC Order Status API
    if (payment.status === "Pending" && isHdfcConfigured()) {
      try {
        const gatewayStatus = await fetchHdfcOrderStatus(
          payment.gatewayOrderId || orderId,
          payment.patientId ? String(payment.patientId) : undefined
        );
        const reconciled = await reconcileHdfcPayment(gatewayStatus, "HDFC Status Check");
        if (reconciled?.payment) {
          payment = reconciled.payment;
        }
      } catch (pollErr) {
        console.warn(`[HDFC Status] Poll check notice for ${orderId}:`, pollErr);
      }
    }

    let entityDetails: Record<string, unknown> | null = null;
    let entityType: "order" | "appointment" | "therapy" | "unknown" = "unknown";
    let entityId: string | undefined;

    if (payment.orderId) {
      entityType = "order";
      entityId = payment.orderId.toString();
      const order = await OrderModel.findById(payment.orderId)
        .select("orderNumber totalAmount status paymentStatus items shippingDetails delivery")
        .lean()
        .exec();
      if (order) entityDetails = order as unknown as Record<string, unknown>;
    } else if (payment.appointmentId) {
      entityType = "appointment";
      entityId = payment.appointmentId.toString();
      const apt = await AppointmentModel.findById(payment.appointmentId)
        .select("date time type serviceName feeAmount status paymentStatus")
        .lean()
        .exec();
      if (apt) entityDetails = apt as unknown as Record<string, unknown>;
    } else if (payment.therapySessionId) {
      entityType = "therapy";
      entityId = payment.therapySessionId.toString();
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: payment.gatewayOrderId || orderId,
        transactionId: payment.gatewayTransactionId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.gatewayPaymentMethod || payment.paymentMethod,
        gatewayProvider: payment.gatewayProvider,
        context: payment.context,
        entityType,
        entityId,
        entityDetails,
        createdAt: payment.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("[HDFC Status] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch payment status.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

