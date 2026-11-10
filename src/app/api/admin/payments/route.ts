import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PaymentSyncService } from "@/modules/payments/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const shouldSyncGateway = url.searchParams.get("sync") === "true";

    // Always sync website database payments (appointments + orders)
    await PaymentSyncService.syncWebsiteDatabasePayments();

    // Optionally sync pending payments from HDFC SmartGateway
    if (shouldSyncGateway) {
      await PaymentSyncService.syncHdfcGatewayPayments();
    }

    const payments = await PaymentSyncService.getCentralizedPayments();

    const totalRevenue = payments
      .filter((p) => p.status === "Success")
      .reduce((acc, p) => acc + (p.amount || 0), 0);

    const successCount = payments.filter((p) => p.status === "Success").length;
    const failedCount = payments.filter((p) => p.status === "Failed").length;
    const pendingCount = payments.filter((p) => p.status === "Pending").length;

    return NextResponse.json({
      success: true,
      data: payments,
      stats: {
        totalRevenue,
        successCount,
        failedCount,
        pendingCount,
        totalTransactions: payments.length,
      },
    });
  } catch (error: any) {
    console.error("Fetch payments error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const [dbResult, gatewayResult] = await Promise.all([
      PaymentSyncService.syncWebsiteDatabasePayments(),
      PaymentSyncService.syncHdfcGatewayPayments(),
    ]);

    const payments = await PaymentSyncService.getCentralizedPayments();

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${gatewayResult.synced} gateway payments and synchronized website orders/appointments.`,
      gatewaySynced: gatewayResult.synced,
      dbSynced: dbResult,
      totalCount: payments.length,
      data: payments,
    });
  } catch (error: any) {
    console.error("Manual payment sync error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
