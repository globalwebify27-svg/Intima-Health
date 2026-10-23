import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { OrderModel } from "@/modules/pharmacy/schema";
import { AuditLogModel } from "@/modules/system/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await OrderModel.findById(id)
      .populate("patientId")
      .populate("consultationId")
      .populate("items.productId")
      .populate("clinicId")
      .exec();

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve order.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const order = await OrderModel.findById(id).exec();
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    // Capture updater info from session if available
    let updaterName = "Staff";
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      const payload = verifyJwt(token);
      if (payload) {
        updaterName = `${payload.name || payload.email} (${payload.role})`;
      }
    }

    // 1. Prescription Verification Handling
    if (body.prescriptionVerification) {
      order.prescriptionVerification = {
        ...order.prescriptionVerification,
        ...body.prescriptionVerification,
        verifiedBy: updaterName,
        verifiedAt: new Date(),
      };

      if (body.prescriptionVerification.status === "Verified") {
        order.status = "Prescription_Approved";
        if (!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
          status: "Prescription_Approved",
          timestamp: new Date(),
          comment: body.prescriptionVerification.notes || "Prescription verified by licensed pharmacist. Order ready for packing.",
          updatedBy: updaterName,
        });

        await AuditLogModel.create({
          userId: updaterName,
          action: "PRESCRIPTION_VERIFIED",
          details: `Order ${order.orderNumber || order._id} prescription approved by ${updaterName}`,
        }).catch((e: unknown) => console.error("Audit log error:", e));
      } else if (body.prescriptionVerification.status === "Rejected") {
        order.status = "Prescription_Rejected";
        if (!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
          status: "Prescription_Rejected",
          timestamp: new Date(),
          comment: body.prescriptionVerification.rejectionReason || "Prescription rejected by pharmacist.",
          updatedBy: updaterName,
        });

        await AuditLogModel.create({
          userId: updaterName,
          action: "PRESCRIPTION_REJECTED",
          details: `Order ${order.orderNumber || order._id} prescription rejected: ${body.prescriptionVerification.rejectionReason}`,
        }).catch((e: unknown) => console.error("Audit log error:", e));
      }
    }

    // 2. Status Transitions & Tracking
    if (body.status && body.status !== order.status) {
      const oldStatus = order.status;
      order.status = body.status;

      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: body.status,
        timestamp: new Date(),
        comment: body.comment || `Status updated from ${oldStatus} to ${body.status}`,
        updatedBy: updaterName,
      });

      // If Dispatched
      if (body.status === "Packed_Dispatched" || body.status === "Shipped") {
        if (!order.delivery) order.delivery = {};
        order.delivery.dispatchedAt = new Date();
        if (body.trackingNumber) order.delivery.trackingNumber = body.trackingNumber;
        if (body.courierPartner) order.delivery.courierPartner = body.courierPartner;
      }

      // If Delivered
      if (body.status === "Delivered") {
        if (!order.delivery) order.delivery = {};
        order.delivery.deliveredAt = new Date();
      }

      // If Cancelled
      if (body.status === "Cancelled") {
        order.cancelledAt = new Date();
        order.cancelledBy = body.cancelledBy || updaterName;
        order.cancellationReason = body.cancellationReason || body.comment || "Cancelled";
        if (order.paymentStatus === "Paid") {
          order.refundStatus = "Pending";
          order.refundAmount = order.totalAmount;
        }
      }

      await AuditLogModel.create({
        userId: updaterName,
        action: "MEDICINE_ORDER_STATUS_CHANGED",
        details: `Order ${order.orderNumber || order._id} moved to ${body.status} by ${updaterName}`,
      }).catch((e: unknown) => console.error("Audit log error:", e));
    }

    // 3. Item-level modifications (Unavailable or Substituted)
    if (body.items && Array.isArray(body.items)) {
      order.items = body.items;
    }

    // 4. Delivery Tracking Updates
    if (body.delivery) {
      order.delivery = {
        ...order.delivery,
        ...body.delivery,
      };
    }

    // 5. Complaint Updates
    if (body.complaintNotes) {
      order.complaintNotes = body.complaintNotes;
      order.complaintStatus = body.complaintStatus || "Open";
    }

    // 6. Direct Fields
    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
    if (body.refundStatus) order.refundStatus = body.refundStatus;

    order.updatedBy = updaterName;
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      data: order,
    });
  } catch (error: unknown) {
    console.error("Order update error:", error);
    const message = error instanceof Error ? error.message : "Failed to update order.";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}
