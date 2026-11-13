import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { PaymentModel } from "@/modules/pharmacy/schema";
import { PaymentSyncService } from "@/modules/payments/service";
import "@/modules/patients/schema";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = new Set([
  "PHARMACY_STAFF",
  "PHARMACY",
  "SUPER_ADMIN",
  "CLINIC_ADMIN",
  "CLINIC_MANAGER",
]);

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload?.role || !ALLOWED_ROLES.has(String(payload.role).toUpperCase())) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const url = new URL(req.url);
    const shouldSyncGateway = url.searchParams.get("sync") === "true";

    await PaymentSyncService.syncWebsiteDatabasePayments();
    if (shouldSyncGateway) {
      await PaymentSyncService.syncHdfcGatewayPayments();
    }

    const payments = await PaymentModel.find({
      $or: [
        { orderId: { $exists: true, $ne: null } },
        { context: /^Pharmacy Order/i },
      ],
      deletedAt: null,
    })
      .populate({
        path: "orderId",
        select: "orderNumber status paymentStatus paymentMethod totalAmount shippingAddress items",
      })
      .populate({
        path: "patientId",
        select: "name phone email",
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const successful = payments.filter((p) => p.status === "Success");
    const totalRevenue = successful.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const cashRevenue = successful
      .filter((p) => p.paymentMethod === "Cash" || p.paymentMethod === "COD")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const onlineRevenue = successful
      .filter((p) => p.paymentMethod !== "Cash" && p.paymentMethod !== "COD")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return NextResponse.json({
      success: true,
      data: payments,
      stats: {
        totalRevenue,
        cashRevenue,
        onlineRevenue,
        successCount: successful.length,
        pendingCount: payments.filter((p) => p.status === "Pending").length,
        failedCount: payments.filter((p) => p.status === "Failed").length,
        totalTransactions: payments.length,
      },
    });
  } catch (error: unknown) {
    console.error("[Pharmacy Payments] Fetch error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch pharmacy payments.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

