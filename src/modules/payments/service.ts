import { connectDB } from "@/db/connect";
import { PaymentModel, IPayment, OrderModel } from "@/modules/pharmacy/schema";
import { AppointmentModel } from "@/modules/appointments/schema";
import { PatientModel } from "@/modules/patients/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { TherapistModel } from "@/modules/therapists/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import Razorpay from "razorpay";

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
   * Syncs recent transactions directly from Razorpay Payment Gateway.
   * Pulls captured, failed, and authorized payments and maps them to website records.
   */
  static async syncRazorpayGatewayPayments(): Promise<{ synced: number; errors: number }> {
    try {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        console.warn("[PaymentSyncService] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing. Skipping gateway pull.");
        return { synced: 0, errors: 0 };
      }

      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      await connectDB();

      // Fetch last 100 payments from Razorpay
      const rzpResponse: any = await razorpay.payments.all({ count: 100 });
      const items = rzpResponse?.items || [];

      let syncedCount = 0;
      let errorCount = 0;

      for (const item of items) {
        try {
          const txnId = item.id;
          const amountInRupees = (item.amount || 0) / 100;
          const currency = item.currency || "INR";
          const method = item.method ? item.method.toUpperCase() : "ONLINE";
          const email = item.email || "";
          const rawContact = item.contact || "";
          const cleanPhone = rawContact.replace(/\D/g, "").slice(-10);

          let status: "Success" | "Failed" | "Pending" | "Refunded" = "Pending";
          if (item.status === "captured") status = "Success";
          else if (item.status === "failed") status = "Failed";
          else if (item.status === "refunded") status = "Refunded";
          else if (item.status === "authorized") status = "Success"; // Authorized is ready for capture/paid

          // Check if appointment or order is linked via notes or transaction ID
          let appointmentId = item.notes?.appointmentId || undefined;
          let orderId = item.notes?.orderId || undefined;
          let patientId = item.notes?.patientId || undefined;

          // 1. Look up appointment by transaction ID if not in notes
          if (!appointmentId) {
            const matchedApt = await AppointmentModel.findOne({
              $or: [{ transactionId: txnId }, { transactionId: item.order_id }],
            }).lean().exec();
            if (matchedApt) {
              appointmentId = matchedApt._id;
              if (!patientId && matchedApt.patientId) {
                patientId = matchedApt.patientId;
              }
            }
          }

          // 2. Look up order by payment ID / order ID if not in notes
          if (!orderId) {
            const matchedOrder = await OrderModel.findOne({
              $or: [
                { transactionId: txnId },
                { "statusHistory.comment": { $regex: txnId } },
              ],
            }).lean().exec();
            if (matchedOrder) {
              orderId = matchedOrder._id;
              if (!patientId && matchedOrder.patientId) {
                patientId = matchedOrder.patientId;
              }
            }
          }

          // 3. Look up patient by contact or email if still missing
          let resolvedPatient: any = null;
          if (patientId) {
            resolvedPatient = await PatientModel.findById(patientId).lean().exec();
          } else if (cleanPhone || email) {
            const query: any[] = [];
            if (cleanPhone) query.push({ phone: new RegExp(cleanPhone + "$") });
            if (email) query.push({ email: email.toLowerCase() });
            resolvedPatient = await PatientModel.findOne({ $or: query }).lean().exec();
            if (resolvedPatient) {
              patientId = resolvedPatient._id;
            }
          }

          // Context deduction
          let context = "Online Payment";
          if (appointmentId) context = "Appointment Consultation";
          else if (orderId) context = "Pharmacy Order";
          else if (item.description) context = item.description;

          const customerName = resolvedPatient?.name || (item.notes?.patientName) || (email ? email.split("@")[0] : `Customer ${cleanPhone}`);

          await PaymentModel.findOneAndUpdate(
            { gatewayTransactionId: txnId },
            {
              $set: {
                gatewayProvider: "Razorpay",
                gatewayTransactionId: txnId,
                amount: amountInRupees,
                currency,
                status,
                paymentMethod: method === "UPI" ? "UPI" : method === "CARD" ? "Card" : `Online (${method})`,
                appointmentId,
                orderId,
                patientId,
                customerName,
                customerPhone: resolvedPatient?.phone || cleanPhone || undefined,
                customerEmail: resolvedPatient?.email || email || undefined,
                context,
                notes: item.notes || {},
                createdAt: new Date(item.created_at * 1000),
              },
            },
            { upsert: true, new: true }
          );

          syncedCount++;
        } catch (itemErr) {
          console.error(`[PaymentSyncService] Error processing Razorpay item ${item?.id}:`, itemErr);
          errorCount++;
        }
      }

      console.log(`[PaymentSyncService] Gateway sync complete: ${syncedCount} synced, ${errorCount} errors.`);
      return { synced: syncedCount, errors: errorCount };
    } catch (err) {
      console.error("[PaymentSyncService] Fatal gateway sync error:", err);
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
            gatewayProvider: (apt.paymentMethod === "Cash" || apt.collectedBy === "Cash") ? "Cash / Counter" : "Razorpay",
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
            gatewayProvider: order.paymentMethod === "Cash" ? "Cash / Counter" : "Razorpay",
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

