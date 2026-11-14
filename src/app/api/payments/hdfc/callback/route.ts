import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PaymentModel } from "@/modules/pharmacy/schema";
import {
  fetchHdfcOrderStatus,
  getHdfcConfig,
  verifyHdfcSignature,
} from "@/lib/payments/hdfc-smartgateway";
import { reconcileHdfcPayment } from "@/lib/payments/reconcile";

export const dynamic = "force-dynamic";

function resolveAppOrigin(req: Request): string {
  const fwdHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const fwdProto =
    req.headers.get("x-forwarded-proto") ||
    (fwdHost?.includes("localhost") || fwdHost?.startsWith("127.") ? "http" : "https");
  if (fwdHost) {
    return `${fwdProto}://${fwdHost}`.replace(/\/+$/, "");
  }
  return (process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin).replace(/\/+$/, "");
}

async function extractParams(req: Request): Promise<Record<string, string>> {
  const params: Record<string, string> = {};
  const url = new URL(req.url);
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  if (req.method === "POST") {
    const contentType = req.headers.get("content-type") || "";
    const rawText = await req.text().catch(() => "");
    if (contentType.includes("application/json")) {
      try {
        const json = JSON.parse(rawText);
        if (json && typeof json === "object") {
          for (const [k, v] of Object.entries(json)) {
            if (v !== undefined && v !== null) params[k] = String(v);
          }
        }
      } catch {}
    } else if (rawText) {
      const formParams = new URLSearchParams(rawText);
      formParams.forEach((value, key) => {
        params[key] = value;
      });
    }
  }
  return params;
}

async function handleCallback(req: Request) {
  const origin = resolveAppOrigin(req);
  try {
    await connectDB();
    const params = await extractParams(req);
    const orderId = params.order_id;

    if (!orderId) {
      return NextResponse.redirect(`${origin}/payment/status?status=failed&reason=missing_order_id`, 303);
    }

    // Verify signed callback if Response Key is configured and signature was sent
    const cfg = getHdfcConfig();
    if (cfg.responseKey && params.signature) {
      const isValidSig = verifyHdfcSignature(params, cfg.responseKey);
      if (!isValidSig) {
        console.warn(`[HDFC Callback] Signature mismatch for order_id=${orderId}; verifying via Order Status API.`);
      }
    }

    // Always verify authoritatively via server-to-server GET /orders/{order_id}
    const existingPayment = await PaymentModel.findOne({
      $or: [{ gatewayOrderId: orderId }, { gatewayTransactionId: orderId }],
    })
      .select("patientId notes")
      .lean()
      .exec();

    const customerId = existingPayment?.patientId ? String(existingPayment.patientId) : undefined;
    const orderStatus = await fetchHdfcOrderStatus(orderId, customerId);
    const reconciled = await reconcileHdfcPayment(orderStatus, "HDFC Callback");

    const customReturnTo = (existingPayment?.notes as any)?.returnTo;
    const statusQuery = reconciled?.status === "Success" ? "success" : reconciled?.status === "Pending" ? "pending" : "failed";

    if (customReturnTo && typeof customReturnTo === "string" && customReturnTo.startsWith("/")) {
      const sep = customReturnTo.includes("?") ? "&" : "?";
      const target = `${origin}${customReturnTo}${sep}payment=${statusQuery}&order_id=${encodeURIComponent(orderId)}`;
      return NextResponse.redirect(target, 303);
    }

    const redirectUrl = new URL(`${origin}/payment/status`);
    redirectUrl.searchParams.set("order_id", orderId);
    redirectUrl.searchParams.set("status", statusQuery);
    if (reconciled?.payment?.amount) {
      redirectUrl.searchParams.set("amount", String(reconciled.payment.amount));
    }
    if (reconciled?.entityType) redirectUrl.searchParams.set("entityType", reconciled.entityType);
    if (reconciled?.entityId) redirectUrl.searchParams.set("entityId", reconciled.entityId);

    return NextResponse.redirect(redirectUrl.toString(), 303);
  } catch (error: unknown) {
    console.error("[HDFC Callback] Error:", error);
    const message = error instanceof Error ? error.message : "verification_error";
    return NextResponse.redirect(
      `${origin}/payment/status?status=failed&reason=${encodeURIComponent(message)}`,
      303
    );
  }
}

export async function GET(req: Request) {
  return handleCallback(req);
}

export async function POST(req: Request) {
  return handleCallback(req);
}

