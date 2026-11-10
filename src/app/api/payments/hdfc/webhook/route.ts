import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { fetchHdfcOrderStatus, getHdfcConfig } from "@/lib/payments/hdfc-smartgateway";
import { reconcileHdfcPayment } from "@/lib/payments/reconcile";

export const dynamic = "force-dynamic";

function verifyWebhookBasicAuth(req: Request): boolean {
  const cfg = getHdfcConfig();
  if (!cfg.webhookUsername || !cfg.webhookPassword) {
    // Allow if webhook basic auth isn't configured yet, because we still perform
    // mandatory server-to-server GET /orders/{order_id} verification before mutating state.
    return true;
  }

  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(authHeader.slice(6).trim(), "base64").toString("utf8");
    const [user, ...passParts] = decoded.split(":");
    const pass = passParts.join(":");
    return user === cfg.webhookUsername && pass === cfg.webhookPassword;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    if (!verifyWebhookBasicAuth(req)) {
      return NextResponse.json({ success: false, error: "Unauthorized webhook request." }, { status: 401 });
    }

    await connectDB();
    const payload = await req.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid JSON payload." }, { status: 400 });
    }

    const orderObj = payload?.content?.order || payload?.order || payload;
    const orderId = orderObj?.order_id;
    const eventName = payload?.event_name || "WEBHOOK_EVENT";

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Missing order_id in webhook payload." }, { status: 400 });
    }

    // Never blindly trust webhook payload: verify authoritatively via Order Status API
    const authoritativeStatus = await fetchHdfcOrderStatus(orderId, orderObj?.customer_id);
    const reconciled = await reconcileHdfcPayment(
      authoritativeStatus,
      `HDFC Webhook (${eventName})`
    );

    return NextResponse.json({
      success: true,
      eventName,
      orderId,
      status: reconciled?.status || authoritativeStatus.status,
      reconciled: Boolean(reconciled),
    });
  } catch (error: unknown) {
    console.error("[HDFC Webhook] Processing error:", error);
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

