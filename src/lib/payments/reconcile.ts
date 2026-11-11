import { connectDB } from "@/db/connect";
import { AppointmentModel } from "@/modules/appointments/schema";
import { OrderModel, PaymentModel, TherapySessionModel } from "@/modules/pharmacy/schema";
import { HdfcOrderStatusResponse, mapHdfcOrderStatus } from "./hdfc-smartgateway";
import { sendAppointmentBookingMessage } from "@/lib/whatsapp";
import { sendAppointmentCustomerEmail } from "@/lib/mail/service";
import { AppointmentNotificationService } from "@/modules/notifications/service";
import { logAuditEvent } from "@/lib/audit";

export interface ReconcileResult {
  payment: any;
  status: "Success" | "Failed" | "Pending" | "Refunded";
  alreadyProcessed: boolean;
  entityType: "order" | "appointment" | "therapy" | "appointment_booking" | "unknown";
  entityId?: string;
  amountMismatch?: boolean;
}

/**
 * Idempotently reconciles an authoritative HDFC Order Status response with PaymentModel
 * and its linked Pharmacy Order, Appointment, or Therapy Session.
 */
export async function reconcileHdfcPayment(
  orderStatus: HdfcOrderStatusResponse,
  updatedBy = "HDFC SmartGateway"
): Promise<ReconcileResult | null> {
  await connectDB();

  const hdfcOrderId = orderStatus.order_id;
  if (!hdfcOrderId) return null;

  const payment = await PaymentModel.findOne({
    $or: [{ gatewayOrderId: hdfcOrderId }, { gatewayTransactionId: hdfcOrderId }],
  }).exec();

  if (!payment) {
    return null;
  }

  let resolvedStatus = mapHdfcOrderStatus(orderStatus.status, orderStatus.status_id);
  let amountMismatch = false;

  // Guard against amount tampering
  if (resolvedStatus === "Success" && orderStatus.amount !== undefined && payment.amount > 0) {
    const gatewayAmt = Number(orderStatus.amount);
    if (Number.isFinite(gatewayAmt) && Math.abs(gatewayAmt - Number(payment.amount)) > 0.5) {
      resolvedStatus = "Failed";
      amountMismatch = true;
    }
  }

  const wasAlreadySuccess = payment.status === "Success";
  const txnId = orderStatus.txn_id || orderStatus.id || payment.gatewayTransactionId || hdfcOrderId;

  payment.gatewayProvider = "HDFC SmartGateway";
  payment.gatewayOrderId = hdfcOrderId;
  if (txnId) payment.gatewayTransactionId = txnId;
  if (orderStatus.payment_method || orderStatus.payment_method_type) {
    const mType = orderStatus.payment_method_type || "";
    const mName = orderStatus.payment_method || "";
    payment.gatewayPaymentMethod = [mType, mName].filter(Boolean).join(" • ");
    payment.paymentMethod = payment.gatewayPaymentMethod || payment.paymentMethod || "Online";
  }
  payment.gatewayRawResponse = orderStatus as unknown as Record<string, any>;
  payment.status = resolvedStatus;
  payment.updatedBy = updatedBy;
  await payment.save();

  let entityType: ReconcileResult["entityType"] = payment.orderId
    ? "order"
    : payment.appointmentId
      ? "appointment"
      : (payment.notes as any)?.pendingBooking
        ? "appointment_booking"
        : payment.therapySessionId
          ? "therapy"
          : "unknown";
  let entityId =
    payment.orderId?.toString() ||
    payment.appointmentId?.toString() ||
    ((payment.notes as any)?.pendingBooking ? payment._id.toString() : undefined) ||
    payment.therapySessionId?.toString();

  if (resolvedStatus !== "Success") {
    return {
      payment,
      status: resolvedStatus,
      alreadyProcessed: false,
      entityType,
      entityId,
      amountMismatch,
    };
  }

  // Reconcile Pharmacy Order
  if (payment.orderId) {
    const order = await OrderModel.findById(payment.orderId).exec();
    if (order && order.paymentStatus !== "Paid") {
      order.paymentId = payment._id as any;
      order.paymentStatus = "Paid";
      order.paymentMethod = "Online";
      if (order.status === "Placed") {
        order.status = "Payment_Confirmed";
      }
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: order.status === "Payment_Confirmed" ? "Payment_Confirmed" : order.status,
        timestamp: new Date(),
        comment: `Online payment of ₹${payment.amount} confirmed (HDFC SmartGateway: ${txnId}).`,
        updatedBy,
      });
      await order.save();
    }
  }

  // Reconcile Appointment (already created, or deferred booking hold)
  const pendingBooking = (payment.notes as any)?.pendingBooking;
  if (!payment.appointmentId && pendingBooking) {
    const claimed = await PaymentModel.findOneAndUpdate(
      {
        _id: payment._id,
        appointmentId: { $exists: false },
        "notes.bookingClaimed": { $ne: true },
      },
      { $set: { "notes.bookingClaimed": true } },
      { new: true }
    ).exec();

    if (claimed) {
      const existingSlotApt = await AppointmentModel.findOne({
        doctorId: pendingBooking.doctorId,
        date: pendingBooking.date,
        time: pendingBooking.time,
        status: { $ne: "Cancelled" },
      }).exec();

      if (existingSlotApt && String(existingSlotApt.patientId) !== String(pendingBooking.patientId)) {
        await PaymentModel.updateOne(
          { _id: payment._id },
          { $set: { "notes.slotConflictAfterHoldExpiry": true } }
        );
        console.error(
          `[HDFC Reconcile] Slot conflict after hold expiry for payment ${payment._id} (${pendingBooking.date} ${pendingBooking.time})`
        );
      } else {
        const createdApt =
          existingSlotApt ||
          (await AppointmentModel.create({
            patientId: pendingBooking.patientId,
            doctorId: pendingBooking.doctorId,
            clinicId: pendingBooking.clinicId,
            date: pendingBooking.date,
            time: pendingBooking.time,
            type: pendingBooking.type,
            serviceName: pendingBooking.serviceName,
            notes: pendingBooking.notes,
            status: "Scheduled",
            paymentMethod: "Online",
            paymentStatus: "Paid",
            transactionId: txnId,
            collectedBy: "HDFC SmartGateway",
            feeAmount: pendingBooking.feeAmount ?? payment.amount,
            createdBy: pendingBooking.createdBy,
          }));

        if (existingSlotApt && existingSlotApt.paymentStatus !== "Paid") {
          existingSlotApt.paymentStatus = "Paid";
          existingSlotApt.paymentMethod = "Online";
          existingSlotApt.transactionId = txnId;
          existingSlotApt.collectedBy = "HDFC SmartGateway";
          await existingSlotApt.save();
        }

        payment.appointmentId = createdApt._id as any;
        await payment.save();

        entityType = "appointment";
        entityId = createdApt._id.toString();

        const aptId = createdApt._id.toString();
        sendAppointmentBookingMessage(aptId, true).catch((err) =>
          console.error("[HDFC Reconcile] WhatsApp notification error:", err)
        );
        sendAppointmentCustomerEmail(aptId).catch((err) =>
          console.error("[HDFC Reconcile] Customer email error:", err)
        );
        AppointmentNotificationService.scheduleAppointmentNotifications(aptId).catch((err) =>
          console.error("[HDFC Reconcile] Automated notification schedule error:", err)
        );
      }
    } else {
      const refreshed = await PaymentModel.findById(payment._id).select("appointmentId").lean().exec();
      if (refreshed?.appointmentId) {
        entityType = "appointment";
        entityId = refreshed.appointmentId.toString();
      }
    }
  } else if (payment.appointmentId) {
    const apt = await AppointmentModel.findById(payment.appointmentId).exec();
    if (apt && apt.paymentStatus !== "Paid") {
      apt.paymentStatus = "Paid";
      apt.paymentMethod = "Online";
      apt.transactionId = txnId;
      apt.collectedBy = "HDFC SmartGateway";
      await apt.save();

      // Keep any mirrored TherapySession record synchronized
      if (apt.patientId && apt.date && apt.time) {
        await TherapySessionModel.updateMany(
          {
            patientId: apt.patientId,
            date: apt.date,
            time: apt.time,
            ...(apt.serviceName ? { name: apt.serviceName } : {}),
          },
          {
            $set: {
              paymentStatus: "Paid",
              paymentMethod: "Online",
              transactionId: txnId,
            },
          }
        );
      }

      const aptId = apt._id.toString();
      sendAppointmentBookingMessage(aptId, true).catch((err) =>
        console.error("[HDFC Reconcile] WhatsApp notification error:", err)
      );
      sendAppointmentCustomerEmail(aptId).catch((err) =>
        console.error("[HDFC Reconcile] Customer email error:", err)
      );
      AppointmentNotificationService.scheduleAppointmentNotifications(aptId).catch((err) =>
        console.error("[HDFC Reconcile] Automated notification schedule error:", err)
      );
    }
  }

  // Reconcile Therapy Session
  if (payment.therapySessionId) {
    const session = await TherapySessionModel.findById(payment.therapySessionId).exec();
    if (session && session.paymentStatus !== "Paid") {
      const pendingSlot = (payment.notes as any)?.pendingSlot;
      const normDate = pendingSlot?.normDate || pendingSlot?.date || session.date;
      const time = pendingSlot?.time || session.time;
      const selectedMode = pendingSlot?.selectedMode || session.selectedMode || "Online";

      const channelName =
        selectedMode === "Online"
          ? session.videoChannelName || `therapy_${session._id}_${Date.now().toString(36)}`
          : session.videoChannelName;

      if (normDate) session.date = normDate;
      if (time) session.time = time;
      if (selectedMode) session.selectedMode = selectedMode;
      session.paymentStatus = "Paid";
      session.paymentMethod = "Online";
      session.transactionId = txnId;
      session.status = normDate && time ? "Scheduled" : "Paid";
      if (channelName) session.videoChannelName = channelName;
      await session.save();

      // Update or create synchronized Appointment if slot exists
      if (normDate && time) {
        const existingApt = await AppointmentModel.findOne({
          patientId: session.patientId,
          date: normDate,
          time,
          $or: [{ transactionId: txnId }, { serviceName: session.name }],
        }).exec();

        if (existingApt) {
          if (existingApt.paymentStatus !== "Paid") {
            existingApt.paymentStatus = "Paid";
            existingApt.paymentMethod = "Online";
            existingApt.transactionId = txnId;
            existingApt.collectedBy = "HDFC SmartGateway";
            await existingApt.save();
          }
        } else {
          const docIdToUse = session.doctorId || session.therapistId;
          if (docIdToUse) {
            const appointment = await AppointmentModel.create({
              patientId: session.patientId,
              doctorId: docIdToUse,
              clinicId: session.clinicId,
              date: normDate,
              time,
              type: selectedMode === "Online" ? "Video" : "Walk-in",
              status: "Scheduled",
              paymentStatus: "Paid",
              paymentMethod: "Online",
              transactionId: txnId,
              collectedBy: "HDFC SmartGateway",
              serviceName: session.name,
              notes: `Assigned Therapy Session (${session.name}) - Mode: ${selectedMode}`,
              feeAmount: session.price || 0,
              videoChannelName: channelName,
            });

            AppointmentNotificationService.scheduleAppointmentNotifications(
              appointment._id.toString()
            ).catch((err) =>
              console.error("[HDFC Reconcile] Automated therapy notification error:", err)
            );
          }
        }
      }

      logAuditEvent({
        userId: session.patientId?.toString(),
        action: "THERAPY_PAYMENT_COMPLETED",
        details: {
          sessionId: session._id.toString(),
          amount: session.price,
          transactionId: txnId,
          gateway: "HDFC SmartGateway",
        },
      }).catch(() => {});
    }
  }

  return {
    payment,
    status: resolvedStatus,
    alreadyProcessed: wasAlreadySuccess,
    entityType,
    entityId,
    amountMismatch,
  };
}

