import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { OrderModel } from "@/modules/pharmacy/schema";
import { AuditLogModel } from "@/modules/system/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();

    const order = await OrderModel.findById(id)
      .populate("patientId", "name email phone")
      .lean();

    if (!order) {
      return NextResponse.json({ success: false, message: "Bill / Order not found." }, { status: 404 });
    }

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

    return NextResponse.json({
      success: true,
      data: {
        _id: order._id.toString(),
        billNumber: order.orderNumber || `BILL-${order._id.toString().substring(18).toUpperCase()}`,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        patient: {
          name: (order.shippingDetails as any)?.fullName || (order.patientId as any)?.name || "Patient",
          email: (order.patientId as any)?.email || "",
          phone: (order.shippingDetails as any)?.phone || (order.patientId as any)?.phone || "",
        },
        shippingDetails: order.shippingDetails,
        shippingAddress: order.shippingAddress || ((order.shippingDetails as any) ? `${(order.shippingDetails as any).street}, ${(order.shippingDetails as any).city} - ${(order.shippingDetails as any).pinCode}` : "Akola, Maharashtra"),
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
      },
    });
  } catch (error: unknown) {
    console.error("Get bill error:", error);
    const message = error instanceof Error ? error.message : "Failed to load bill.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const order = await OrderModel.findById(id);

    if (!order) {
      return NextResponse.json({ success: false, message: "Bill / Order not found." }, { status: 404 });
    }

    const updaterName = payload.name || payload.email || "Administrator";

    // Extract billing adjustments
    const itemsTotal = Math.max(0, Number(body.itemsTotal) || 0);
    const taxPercent = Math.max(0, Number(body.taxPercent) || 0);
    const taxAmount = Math.max(0, Number(body.taxAmount) || 0);
    const deliveryCharge = Math.max(0, Number(body.deliveryCharge) || 0);
    const packingCharge = Math.max(0, Number(body.packingCharge) || 0);
    const handlingCharge = Math.max(0, Number(body.handlingCharge) || 0);
    const discountAmount = Math.max(0, Number(body.discountAmount) || 0);

    const rawAdditional = Array.isArray(body.additionalCharges) ? body.additionalCharges : [];
    const additionalCharges = rawAdditional
      .filter((c: any) => c && typeof c.name === "string" && c.name.trim())
      .map((c: any) => ({
        id: c.id || Math.random().toString(36).substring(2, 9),
        name: c.name.trim(),
        amount: Number(c.amount) || 0,
      }));

    // Calculate final payable amount if not directly provided
    const computedTotal = Math.max(
      0,
      itemsTotal +
        taxAmount +
        deliveryCharge +
        packingCharge +
        handlingCharge +
        additionalCharges.reduce((acc: number, c: any) => acc + (Number(c.amount) || 0), 0) -
        discountAmount
    );

    const totalPayable = typeof body.totalPayable === "number" ? Math.max(0, body.totalPayable) : computedTotal;

    // Apply to order pricing and order total
    order.pricing = {
      itemsTotal,
      taxPercent,
      taxAmount,
      deliveryCharge,
      packingCharge,
      handlingCharge,
      additionalCharges,
      discountAmount,
      totalPayable,
      customizedAt: new Date(),
      customizedBy: updaterName,
      notes: typeof body.notes === "string" ? body.notes.trim() : order.pricing?.notes,
    };

    order.totalAmount = totalPayable;
    order.updatedBy = updaterName;

    await order.save();

    // Log in audit log
    await AuditLogModel.create({
      userId: updaterName,
      action: "BILLING_CUSTOMIZED",
      details: `Bill for Order ${order.orderNumber || order._id} customized by ${updaterName}. New Total: ₹${totalPayable}`,
    }).catch((e: unknown) => console.error("Audit log error:", e));

    return NextResponse.json({
      success: true,
      message: `Bill ${order.orderNumber || order._id} updated successfully.`,
      data: {
        _id: order._id.toString(),
        totalAmount: order.totalAmount,
        pricing: order.pricing,
      },
    });
  } catch (error: unknown) {
    console.error("Customize bill error:", error);
    const message = error instanceof Error ? error.message : "Failed to update bill.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

