import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { OrderModel } from "@/modules/pharmacy/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !["SUPER_ADMIN", "ADMIN", "CLINIC_ADMIN", "CLINIC_MANAGER"].includes(payload.role)) {
      return NextResponse.json({ success: false, message: "Forbidden. Admin access required." }, { status: 403 });
    }

    await connectDB();

    const orders = await OrderModel.find({ deletedAt: null })
      .populate("patientId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    let totalRevenue = 0;
    let customizedCount = 0;
    let additionalChargesTotal = 0;

    const bills = orders.map((order: any) => {
      // 1. Calculate or use existing itemsTotal
      const computedItemsTotal = (order.items || []).reduce(
        (sum: number, it: any) => sum + (Number(it.priceAtPurchase) || 0) * (Number(it.quantity) || 1),
        0
      );

      const itemsTotal = order.pricing?.itemsTotal ?? computedItemsTotal;
      const taxPercent = order.pricing?.taxPercent ?? 12;
      const taxAmount = order.pricing?.taxAmount ?? 0;
      const deliveryCharge = order.pricing?.deliveryCharge ?? 0;
      const packingCharge = order.pricing?.packingCharge ?? 0;
      const handlingCharge = order.pricing?.handlingCharge ?? 0;
      const additionalCharges = order.pricing?.additionalCharges || [];
      const discountAmount = order.pricing?.discountAmount ?? 0;
      const totalPayable = order.pricing?.totalPayable ?? order.totalAmount ?? (itemsTotal + taxAmount + deliveryCharge);

      totalRevenue += totalPayable;

      const orderAdditionalSum = additionalCharges.reduce((acc: number, c: any) => acc + (Number(c.amount) || 0), 0) + packingCharge + handlingCharge;
      additionalChargesTotal += orderAdditionalSum;

      if (order.pricing?.customizedAt || additionalCharges.length > 0 || packingCharge > 0 || handlingCharge > 0) {
        customizedCount++;
      }

      return {
        _id: order._id.toString(),
        billNumber: order.orderNumber || `BILL-${order._id.toString().substring(18).toUpperCase()}`,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        patient: {
          name: order.shippingDetails?.fullName || order.patientId?.name || "Patient",
          email: order.patientId?.email || "",
          phone: order.shippingDetails?.phone || order.patientId?.phone || "",
        },
        shippingDetails: order.shippingDetails,
        shippingAddress: order.shippingAddress || (order.shippingDetails ? `${order.shippingDetails.street}, ${order.shippingDetails.city} - ${order.shippingDetails.pinCode}` : "Akola, Maharashtra"),
        paymentMethod: order.paymentMethod || "Online",
        paymentStatus: order.paymentStatus || "Pending",
        orderStatus: order.status || "Pending",
        items: (order.items || []).map((it: any) => ({
          name: it.name || "Medicine",
          quantity: it.quantity || 1,
          priceAtPurchase: it.priceAtPurchase || 0,
          total: (it.priceAtPurchase || 0) * (it.quantity || 1),
          isPrescription: !!it.isPrescription,
        })),
        pricing: {
          itemsTotal,
          taxPercent,
          taxAmount,
          deliveryCharge,
          packingCharge,
          handlingCharge,
          additionalCharges,
          discountAmount,
          totalPayable,
          customizedAt: order.pricing?.customizedAt,
          customizedBy: order.pricing?.customizedBy,
          notes: order.pricing?.notes,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        bills,
        summary: {
          totalBills: bills.length,
          totalRevenue,
          customizedCount,
          additionalChargesTotal,
        },
      },
    });
  } catch (error: unknown) {
    console.error("Fetch bills error:", error);
    const message = error instanceof Error ? error.message : "Failed to load bills.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

