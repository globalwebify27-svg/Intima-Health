import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { AppointmentModel } from "@/modules/appointments/schema";
import { OrderModel, PaymentModel, TherapySessionModel } from "@/modules/pharmacy/schema";
import { PatientModel } from "@/modules/patients/schema";
import { AppointmentService, APPOINTMENT_SLOT_HOLD_MS, PendingOnlineBookingPayload } from "@/modules/appointments/service";
import "@/modules/doctors/schema";
import {
  createHdfcSession,
  generateHdfcOrderId,
  isHdfcConfigured,
} from "@/lib/payments/hdfc-smartgateway";

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

function normalizeTherapyDate(dateStr: string): { normDate: string; valid: boolean; past: boolean } {
  const istTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const nowIST = new Date(istTimeStr);
  const rawParts = dateStr.trim().split(/[-/]/).map(Number);
  if (rawParts.length !== 3 || rawParts.some(Number.isNaN)) {
    return { normDate: dateStr, valid: false, past: false };
  }
  let year: number;
  let month: number;
  let day: number;
  if (rawParts[0] > 1000) {
    [year, month, day] = rawParts;
  } else {
    [day, month, year] = rawParts;
  }
  const todayMidnight = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate());
  const selectedMidnight = new Date(year, month - 1, day);
  const normDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { normDate, valid: true, past: selectedMidnight < todayMidnight };
}

export async function POST(req: Request) {
  try {
    if (!isHdfcConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "HDFC SmartGateway is not configured. Please set HDFC_API_KEY, HDFC_MERCHANT_ID, and HDFC_PAYMENT_PAGE_CLIENT_ID.",
        },
        { status: 503 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { entityType, entityId, returnTo, pendingSlot, pendingBooking, retryOrderId } = body as {
      entityType: "order" | "appointment" | "therapy" | "appointment_booking";
      entityId?: string;
      returnTo?: string;
      pendingSlot?: { date?: string; time?: string; selectedMode?: "Online" | "Offline" };
      pendingBooking?: PendingOnlineBookingPayload;
      retryOrderId?: string;
    };

    if (!entityType || (!entityId && entityType !== "appointment_booking")) {
      return NextResponse.json(
        { success: false, error: "entityType and entityId are required." },
        { status: 400 }
      );
    }

    let amount = 0;
    let customerId = `CUST_${entityId || "BOOK"}`;
    let customerName = "Patient";
    let customerEmail: string | undefined;
    let customerPhone: string | undefined;
    let patientId: any;
    let context = "Website Payment";
    let description = "Kelkar Manas Healthcare Payment";
    let prefix = "KM";
    let udf2Value = entityId || "";
    const notes: Record<string, unknown> = { entityType, entityId };
    if (returnTo) notes.returnTo = returnTo;

    if (entityType === "order") {
      prefix = "ORD";
      const orderIdStr = entityId!;
      const order = await OrderModel.findById(orderIdStr).populate("patientId", "name phone email").exec();
      if (!order) {
        return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
      }
      if (order.paymentStatus === "Paid") {
        return NextResponse.json({ success: false, error: "Order is already paid." }, { status: 400 });
      }
      amount = Number(order.totalAmount || order.pricing?.totalPayable || 0);
      patientId = (order.patientId as any)?._id || order.patientId;
      customerId = patientId ? String(patientId) : customerId;
      customerName = order.shippingDetails?.fullName || (order.patientId as any)?.name || "Customer";
      customerPhone = order.shippingDetails?.phone || (order.patientId as any)?.phone;
      customerEmail = (order.patientId as any)?.email;
      context = `Pharmacy Order (${order.orderNumber || orderIdStr.slice(-6)})`;
      description = `Pharmacy Order ${order.orderNumber || ""}`.trim();
    } else if (entityType === "appointment") {
      prefix = "APT";
      const apt = await AppointmentModel.findById(entityId!)
        .populate("patientId", "name phone email")
        .populate("doctorId", "name consultationFee")
        .exec();
      if (!apt) {
        return NextResponse.json({ success: false, error: "Appointment not found." }, { status: 404 });
      }
      if (apt.paymentStatus === "Paid") {
        return NextResponse.json({ success: false, error: "Appointment fee is already paid." }, { status: 400 });
      }
      amount = Number(apt.feeAmount || (apt.doctorId as any)?.consultationFee || 0);
      patientId = (apt.patientId as any)?._id || apt.patientId;
      customerId = patientId ? String(patientId) : customerId;
      customerName = (apt.patientId as any)?.name || "Patient";
      customerPhone = (apt.patientId as any)?.phone;
      customerEmail = (apt.patientId as any)?.email;
      context = `Appointment (${apt.type || "Consultation"}${apt.serviceName ? ` • ${apt.serviceName}` : ""})`;
      description = `${apt.serviceName || "Consultation Fee"}`;
    } else if (entityType === "appointment_booking") {
      prefix = "APT";
      let resolvedPending = pendingBooking;

      if (!resolvedPending && (retryOrderId || entityId)) {
        const prevPayment = await PaymentModel.findOne(
          retryOrderId
            ? { $or: [{ gatewayOrderId: retryOrderId }, { gatewayTransactionId: retryOrderId }] }
            : { _id: entityId }
        ).exec();

        if (!prevPayment) {
          return NextResponse.json({ success: false, error: "Previous payment session not found." }, { status: 404 });
        }
        if (prevPayment.status === "Success" || prevPayment.appointmentId) {
          return NextResponse.json(
            { success: false, error: "This appointment is already confirmed and paid." },
            { status: 400 }
          );
        }
        resolvedPending = (prevPayment.notes as { pendingBooking?: PendingOnlineBookingPayload })?.pendingBooking;
      }

      if (!resolvedPending?.patientId || !resolvedPending?.doctorId || !resolvedPending?.date || !resolvedPending?.time) {
        return NextResponse.json(
          { success: false, error: "Pending booking details are required to start payment." },
          { status: 400 }
        );
      }

      // Re-validate slot availability (allowing this patient's own active hold) & recompute fee
      const validatedPending = await AppointmentService.validateSlotAndComputeFee(
        resolvedPending,
        resolvedPending.patientId,
        resolvedPending.createdBy
      );

      // Supersede any prior pending hold by this same patient for the same slot
      await PaymentModel.updateMany(
        {
          patientId: validatedPending.patientId,
          status: "Pending",
          "notes.pendingBooking.doctorId": validatedPending.doctorId,
          "notes.pendingBooking.date": validatedPending.date,
          "notes.pendingBooking.time": validatedPending.time,
        },
        {
          $set: {
            status: "Failed",
            "notes.supersededByRetry": true,
          },
        }
      );

      const patientDoc = await PatientModel.findById(validatedPending.patientId)
        .select("name phone email")
        .lean()
        .exec();

      if (!patientDoc) {
        return NextResponse.json({ success: false, error: "Patient profile not found." }, { status: 404 });
      }

      const holdExpiresAt = new Date(Date.now() + APPOINTMENT_SLOT_HOLD_MS);
      notes.pendingBooking = validatedPending;
      notes.holdExpiresAt = holdExpiresAt.toISOString();

      amount = Number(validatedPending.feeAmount || 0);
      patientId = validatedPending.patientId;
      customerId = String(validatedPending.patientId);
      customerName = patientDoc.name || "Patient";
      customerPhone = patientDoc.phone;
      customerEmail = patientDoc.email;
      udf2Value = validatedPending.doctorId;
      context = `Appointment (${validatedPending.type || "Consultation"}${validatedPending.serviceName ? ` • ${validatedPending.serviceName}` : ""})`;
      description = `${validatedPending.serviceName || "Consultation Fee"}`;
    } else if (entityType === "therapy") {
      prefix = "THP";
      const session = await TherapySessionModel.findById(entityId)
        .populate("patientId", "name phone email")
        .exec();
      if (!session) {
        return NextResponse.json({ success: false, error: "Therapy session not found." }, { status: 404 });
      }
      if (session.paymentStatus === "Paid") {
        return NextResponse.json({ success: false, error: "Therapy session is already paid." }, { status: 400 });
      }

      if (pendingSlot?.date && pendingSlot?.time) {
        const parsedDate = normalizeTherapyDate(pendingSlot.date);
        if (!parsedDate.valid || parsedDate.past) {
          return NextResponse.json(
            { success: false, error: "Cannot schedule a therapy session for a past or invalid date." },
            { status: 400 }
          );
        }
        if (session.therapistId) {
          const conflict = await AppointmentModel.findOne({
            doctorId: session.therapistId,
            date: parsedDate.normDate,
            time: pendingSlot.time,
            status: { $nin: ["Cancelled", "Completed"] },
          }).exec();
          if (conflict) {
            return NextResponse.json(
              { success: false, error: "The therapist already has a scheduled session at this time slot." },
              { status: 400 }
            );
          }
        }
        notes.pendingSlot = {
          date: pendingSlot.date,
          normDate: parsedDate.normDate,
          time: pendingSlot.time,
          selectedMode: pendingSlot.selectedMode || "Online",
        };
      }

      amount = Number(session.price || 0);
      patientId = (session.patientId as any)?._id || session.patientId;
      customerId = patientId ? String(patientId) : customerId;
      customerName = (session.patientId as any)?.name || "Patient";
      customerPhone = (session.patientId as any)?.phone;
      customerEmail = (session.patientId as any)?.email;
      context = `Therapy Session (${session.name})`;
      description = `Therapy: ${session.name}`;
    } else {
      return NextResponse.json({ success: false, error: "Unsupported entityType." }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Payable amount must be greater than zero." },
        { status: 400 }
      );
    }

    const hdfcOrderId = generateHdfcOrderId(prefix);
    const appOrigin = resolveAppOrigin(req);
    const returnUrl = `${appOrigin}/api/payments/hdfc/callback`;

    const [firstName, ...restName] = customerName.trim().split(/\s+/);
    const lastName = restName.join(" ") || undefined;

    // Create Pending Payment record prior to gateway redirect
    const payment = await PaymentModel.create({
      orderId: entityType === "order" ? entityId : undefined,
      appointmentId: entityType === "appointment" ? entityId : undefined,
      therapySessionId: entityType === "therapy" ? entityId : undefined,
      patientId,
      customerName,
      customerPhone,
      customerEmail,
      context,
      paymentMethod: "Online",
      gatewayProvider: "HDFC SmartGateway",
      gatewayOrderId: hdfcOrderId,
      gatewayTransactionId: hdfcOrderId, // temporary unique key replaced by actual txn_id on callback/webhook
      amount,
      currency: "INR",
      status: "Pending",
      notes,
    });

    try {
      const sessionRes = await createHdfcSession({
        orderId: hdfcOrderId,
        amount,
        currency: "INR",
        customerId,
        customerEmail: customerEmail && !customerEmail.endsWith("@noemail-intima.com") ? customerEmail : undefined,
        customerPhone,
        firstName,
        lastName,
        description,
        returnUrl,
        udf1: entityType,
        udf2: udf2Value,
        udf3: payment._id.toString(),
      });

      payment.gatewaySessionId = sessionRes.id;
      await payment.save();

      return NextResponse.json({
        success: true,
        orderId: hdfcOrderId,
        paymentId: payment._id.toString(),
        paymentUrl: sessionRes.payment_links?.web,
        sessionStatus: sessionRes.status,
      });
    } catch (sessionErr: any) {
      payment.status = "Failed";
      payment.gatewayRawResponse = { error: sessionErr?.message || "Session creation failed" };
      await payment.save();
      throw sessionErr;
    }
  } catch (error: unknown) {
    console.error("[HDFC Session] Initialization error:", error);
    const message = error instanceof Error ? error.message : "Failed to initialize HDFC SmartGateway payment.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

