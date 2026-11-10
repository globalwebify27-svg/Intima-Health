import { connectDB } from "@/db/connect";
import { PaymentModel, IPayment, OrderModel } from "@/modules/pharmacy/schema";
import { AppointmentModel } from "@/modules/appointments/schema";
import { PatientModel } from "@/modules/patients/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { TherapistModel } from "@/modules/therapists/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import { fetchHdfcOrderStatus, isHdfcConfigured } from "@/lib/payments/hdfc-smartgateway";
import { reconcileHdfcPayment } from "@/lib/payments/reconcile";

export interface UnifiedPaymentItem {
  _id: string;
  date: string;
  transactionId: string;
  patient: {
    name: string;
    phone: string;
    email?: string;
  };
  doctor?: {
    name: string;
    specialization?: string;
    role: "Doctor" | "Therapist";
  } | null;
  clinic?: {
    name: string;
    city?: string;
  } | null;
  context: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: "Success" | "Failed" | "Pending" | "Refunded";
  rawPaymentId?: string;
}

export class PaymentSyncService {
  /**
   * Reconciles pending HDFC SmartGateway payments directly against the Order Status API.
   */
  static async syncHdfcGatewayPayments(): Promise<{ synced: number; errors: number }> {
    try {
      if (!isHdfcConfigured()) {
        console.warn("[PaymentSyncService] HDFC SmartGateway credentials missing. Skipping gateway pull.");
        return { synced: 0, errors: 0 };
      }

      await connectDB();

      const pendingHdfcPayments = await PaymentModel.find({
        gatewayProvider: "HDFC SmartGateway",
        status: "Pending",
        gatewayOrderId: { $exists: true, $ne: "" },
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
        .exec();

      let syncedCount = 0;
      let errorCount = 0;

      for (const item of pendingHdfcPayments) {
        try {
          const orderId = item.gatewayOrderId || item.gatewayTransactionId;
          if (!orderId) continue;

          const gatewayStatus = await fetchHdfcOrderStatus(
            orderId,
            item.patientId ? String(item.patientId) : undefined
          );
          const reconciled = await reconcileHdfcPayment(gatewayStatus, "Admin Gateway Sync");
          if (reconciled && reconciled.status !== "Pending") {
            syncedCount++;
          }
        } catch (itemErr) {
          console.error(`[PaymentSyncService] Error syncing HDFC order ${item?.gatewayOrderId}:`, itemErr);
          errorCount++;
        }
      }

      console.log(`[PaymentSyncService] HDFC gateway sync complete: ${syncedCount} updated, ${errorCount} errors.`);
      return { synced: syncedCount, errors: errorCount };
    } catch (err) {
      console.error("[PaymentSyncService] Fatal HDFC gateway sync error:", err);
      return { synced: 0, errors: 1 };
    }
  }

  /**
   * Syncs paid appointment and pharmacy records from website database into PaymentModel
   * ensuring no paid transaction from any service is missing.
   */
  static async syncWebsiteDatabasePayments(): Promise<number> {
    try {
      await connectDB();
      let importedCount = 0;

      // 1. Sync Paid Appointments
      const paidAppointments = await AppointmentModel.find({
        $or: [
          { paymentStatus: "Paid" },
          { transactionId: { $exists: true, $ne: "" } },
        ],
      })
        .populate("patientId", "name phone email")
        .populate("doctorId", "name specialization clinicId")
        .populate("clinicId", "name city")
        .lean()
        .exec();

      for (const apt of paidAppointments) {
        const txnId = apt.transactionId || `APT-${apt._id.toString()}`;
        const existing = await PaymentModel.findOne({
          $or: [{ gatewayTransactionId: txnId }, { appointmentId: apt._id }],
        }).exec();

        const patient = apt.patientId as any;
        const doctor = apt.doctorId as any;
        const clinic = apt.clinicId as any;
        const context = `Appointment (${apt.type || "Consultation"}${apt.serviceName ? ` • ${apt.serviceName}` : ""})`;

        if (!existing) {
          await PaymentModel.create({
            appointmentId: apt._id,
            patientId: patient?._id,
            customerName: patient?.name,
            customerPhone: patient?.phone,
            customerEmail: patient?.email,
            context,
            paymentMethod: apt.paymentMethod || "Online",
            gatewayProvider: (apt.paymentMethod === "Cash" || apt.collectedBy === "Cash") ? "Cash / Counter" : "HDFC SmartGateway",
            gatewayTransactionId: txnId,
            amount: apt.feeAmount || 0,
            currency: "INR",
            status: "Success",
            createdAt: apt.createdAt || new Date(),
          });
          importedCount++;
        } else {
          // Heal missing fields if null
          let changed = false;
          if (!existing.appointmentId) { existing.appointmentId = apt._id; changed = true; }
          if (!existing.patientId && patient?._id) { existing.patientId = patient._id; changed = true; }
          if (!existing.customerName && patient?.name) { existing.customerName = patient.name; changed = true; }
          if (!existing.customerPhone && patient?.phone) { existing.customerPhone = patient.phone; changed = true; }
          if (!existing.context) { existing.context = context; changed = true; }
          if (changed) await existing.save();
        }
      }

      // 2. Sync Paid Pharmacy Orders
      const paidOrders = await OrderModel.find({
        $or: [
          { paymentStatus: "Paid" },
          { status: "Payment_Confirmed" },
          { status: "Fulfilled" },
          { status: "Delivered" },
        ],
      })
        .populate("patientId", "name phone email")
        .populate("clinicId", "name city")
        .lean()
        .exec();

      for (const order of paidOrders) {
        const txnId = (order as any).transactionId || `ORD-${order._id.toString()}`;
        const existing = await PaymentModel.findOne({
          $or: [{ gatewayTransactionId: txnId }, { orderId: order._id }],
        }).exec();

        const patient = order.patientId as any;
        const context = `Pharmacy Order (${order.orderNumber || `#${order._id.toString().substring(18)}`})`;

        if (!existing) {
          await PaymentModel.create({
            orderId: order._id,
            patientId: patient?._id,
            customerName: patient?.name,
            customerPhone: patient?.phone,
            customerEmail: patient?.email,
            context,
            paymentMethod: order.paymentMethod || "Online",
            gatewayProvider: order.paymentMethod === "Cash" ? "Cash / Counter" : "HDFC SmartGateway",
            gatewayTransactionId: txnId,
            amount: order.totalAmount || 0,
            currency: "INR",
            status: "Success",
            createdAt: order.createdAt || new Date(),
          });
          importedCount++;
        } else {
          let changed = false;
          if (!existing.orderId) { existing.orderId = order._id; changed = true; }
          if (!existing.patientId && patient?._id) { existing.patientId = patient._id; changed = true; }
          if (!existing.customerName && patient?.name) { existing.customerName = patient.name; changed = true; }
          if (!existing.customerPhone && patient?.phone) { existing.customerPhone = patient.phone; changed = true; }
          if (!existing.context) { existing.context = context; changed = true; }
          if (changed) await existing.save();
        }
      }

      return importedCount;
    } catch (err) {
      console.error("[PaymentSyncService] Error syncing website database payments:", err);
      return 0;
    }
  }

  /**
   * Returns a complete, centralized list of all transactions processed through the website.
   */
  static async getCentralizedPayments(): Promise<UnifiedPaymentItem[]> {
    await connectDB();

    const rawPayments = await PaymentModel.find()
      .populate("patientId", "name phone email")
      .populate({
        path: "appointmentId",
        select: "date time type doctorId clinicId serviceName feeAmount",
        populate: [
          { path: "doctorId", select: "name specialization clinicId" },
          { path: "clinicId", select: "name city" },
        ],
      })
      .populate({
        path: "orderId",
        select: "orderNumber totalAmount clinicId items",
        populate: [{ path: "clinicId", select: "name city" }],
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const unifiedList: UnifiedPaymentItem[] = [];

    for (const p of rawPayments) {
      const patientObj = (p.patientId as any);
      const appointmentObj = (p.appointmentId as any);
      const orderObj = (p.orderId as any);

      // Patient resolution
      const patientName = patientObj?.name || p.customerName || "Patient";
      const patientPhone = patientObj?.phone || p.customerPhone || "";
      const patientEmail = patientObj?.email || p.customerEmail || "";

      // Doctor / Specialist resolution
      let doctor: UnifiedPaymentItem["doctor"] = null;
      if (appointmentObj?.doctorId) {
        doctor = {
          name: appointmentObj.doctorId.name || "Specialist",
          specialization: appointmentObj.doctorId.specialization,
          role: "Doctor",
        };
      }

      // Clinic resolution
      let clinic: UnifiedPaymentItem["clinic"] = null;
      if (appointmentObj?.clinicId) {
        clinic = {
          name: appointmentObj.clinicId.name || "Clinic",
          city: appointmentObj.clinicId.city,
        };
      } else if (orderObj?.clinicId) {
        clinic = {
          name: orderObj.clinicId.name || "Clinic Pharmacy",
          city: orderObj.clinicId.city,
        };
      }

      // Context resolution
      let context = p.context || "Website Payment";
      if (appointmentObj) {
        context = `Appointment (${appointmentObj.type || "Consultation"}${appointmentObj.serviceName ? ` • ${appointmentObj.serviceName}` : ""})`;
      } else if (orderObj) {
        context = `Pharmacy Order (${orderObj.orderNumber || "Order"})`;
      }

      unifiedList.push({
        _id: p._id.toString(),
        date: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        transactionId: p.gatewayTransactionId || p._id.toString(),
        patient: {
          name: patientName,
          phone: patientPhone,
          email: patientEmail,
        },
        doctor,
        clinic,
        context,
        paymentMethod: p.paymentMethod || (p.gatewayProvider === "Cash" ? "Cash" : "Online"),
        amount: p.amount || 0,
        currency: p.currency || "INR",
        status: (p.status as any) || "Success",
        rawPaymentId: p._id.toString(),
      });
    }

    return unifiedList;
  }
}

