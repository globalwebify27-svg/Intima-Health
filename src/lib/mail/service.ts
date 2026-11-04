import { getMailTransporter, getMailConfig, getMailTransporterAsync, getResolvedMailConfig, getMailLogoAttachment } from "./transporter";
import { generateAppointmentCustomerEmail } from "./templates/appointment";
import { generateOrderCustomerEmail, OrderEmailItem } from "./templates/order";
import { generatePatientWelcomeEmail } from "./templates/welcome";
import { 
  generateDailyAdminReportEmail, 
  DailyReportAppointment, 
  DailyReportOrder, 
  DailyReportPatient, 
  DailyReportInquiry 
} from "./templates/daily-admin-report";
import { connectDB } from "@/db/connect";
import { AppointmentModel } from "@/modules/appointments/schema";
import { PatientModel } from "@/modules/patients/schema";
import { OrderModel } from "@/modules/pharmacy/schema";
import { ContactSubmissionModel } from "@/modules/contact/schema";
import { SettingModel } from "@/modules/system/schema";
import { generateContactInquiryAdminEmail } from "./templates/contact";
import { generateMedicineOrderRequestEmail, MedicineOrderItemData } from "./templates/medicine-order-request";
import { ClinicModel } from "@/modules/clinics/schema";

interface PopulatedRef {
  _id?: unknown;
  name?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  address?: string;
  city?: string;
}

interface RawOrderItem {
  name?: string;
  quantity?: number;
  priceAtPurchase?: number;
  dosage?: string;
  isPrescription?: boolean;
}

interface RawContactInquiry {
  firstName?: string;
  lastName?: string;
  email?: string;
  subject?: string;
  message?: string;
  createdAt?: Date;
}

interface RawAppointmentDoc {
  patientId?: PopulatedRef;
  doctorId?: PopulatedRef;
  date?: string;
  time?: string;
  type?: "Video" | "Walk-in";
  serviceName?: string;
  paymentStatus?: "Paid" | "Pending" | "Refunded";
  feeAmount?: number;
}

interface RawOrderDoc {
  _id: unknown;
  orderNumber?: string;
  shippingDetails?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    pinCode?: string;
    receiverName?: string;
    receiverPhone?: string;
  };
  patientId?: PopulatedRef;
  items?: RawOrderItem[];
  totalAmount?: number;
  paymentMethod?: string;
  shippingAddress?: string;
}

interface RawPatientDoc {
  name: string;
  email?: string;
  phone?: string;
  createdAt?: Date;
}

/**
 * Checks whether an email is a real, deliverable customer email address.
 * Rejects empty emails and placeholder domains (@intima.app, @noemail-intima.com, @example.com).
 * Customer email notifications are ONLY sent if this returns true.
 */
export function isValidCustomerNotificationEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return false;
  if (
    trimmed.endsWith("@intima.app") ||
    trimmed.includes("@noemail-intima.com") ||
    trimmed.endsWith("@example.com")
  ) {
    return false;
  }
  return true;
}

/**
 * 1. Send Instant Appointment Confirmation to Customer
 */
export async function sendAppointmentCustomerEmail(appointmentId: string): Promise<boolean> {
  try {
    const transporter = (await getMailTransporterAsync()) || getMailTransporter();
    const config = await getResolvedMailConfig();
    if (!transporter) {
      console.log(`[Mail Service] SMTP not configured. Skipping customer appointment email for ID: ${appointmentId}`);
      return false;
    }

    await connectDB();
    const apt = await AppointmentModel.findById(appointmentId)
      .populate("patientId")
      .populate("doctorId")
      .populate("clinicId")
      .exec();

    if (!apt || !apt.patientId) {
      console.warn(`[Mail Service] Appointment ${appointmentId} or linked patient not found.`);
      return false;
    }

    const patient = apt.patientId as unknown as PopulatedRef;
    const doctor = apt.doctorId as unknown as PopulatedRef;
    const clinic = apt.clinicId as unknown as PopulatedRef;

    if (!isValidCustomerNotificationEmail(patient.email)) {
      console.log(`[Mail Service] Patient has no valid notification email configured (${patient.email}). Skipping appointment email.`);
      return false;
    }

    const { subject, html } = generateAppointmentCustomerEmail({
      patientName: patient.name || "Patient",
      doctorName: doctor?.name || "Consulting Doctor",
      doctorSpecialization: doctor?.specialization,
      clinicName: clinic?.name || "Kelkar Manas Health Care",
      clinicAddress: clinic ? `${clinic.address}, ${clinic.city}` : undefined,
      date: apt.date,
      time: apt.time,
      type: apt.type as "Video" | "Walk-in",
      serviceName: apt.serviceName,
      feeAmount: apt.feeAmount,
      paymentStatus: apt.paymentStatus,
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: patient.email,
      subject,
      html,
      attachments: getMailLogoAttachment(),
    });

    console.log(`[Mail Service] Successfully sent appointment confirmation email to ${patient.email}`);
    return true;
  } catch (error) {
    console.error(`[Mail Service] Error sending appointment email:`, error);
    return false;
  }
}

/**
 * 2. Send Instant Medicine Delivery Invoice to Customer
 */
export async function sendOrderCustomerEmail(orderId: string): Promise<boolean> {
  try {
    const transporter = (await getMailTransporterAsync()) || getMailTransporter();
    const config = await getResolvedMailConfig();
    if (!transporter) {
      console.log(`[Mail Service] SMTP not configured. Skipping customer order email for ID: ${orderId}`);
      return false;
    }

    await connectDB();
    const order = await OrderModel.findById(orderId)
      .populate("patientId")
      .exec();

    if (!order) {
      console.warn(`[Mail Service] Order ${orderId} not found.`);
      return false;
    }

    const patient = order.patientId as unknown as PopulatedRef;
    const recipientEmail = patient?.email;

    if (!isValidCustomerNotificationEmail(recipientEmail)) {
      console.log(`[Mail Service] Order recipient has no valid notification email configured (${recipientEmail}). Skipping order receipt email.`);
      return false;
    }

    const formattedItems: OrderEmailItem[] = (order.items || []).map((i: RawOrderItem) => ({
      name: i.name || "Medication",
      quantity: i.quantity || 1,
      price: i.priceAtPurchase || 0,
      dosage: i.dosage,
      isPrescription: !!i.isPrescription,
    }));

    const pricing = order.pricing || {
      itemsTotal: order.totalAmount,
      taxAmount: 0,
      deliveryCharge: 0,
    };

    const { subject, html } = generateOrderCustomerEmail({
      orderNumber: order.orderNumber || order._id.toString(),
      patientName: order.shippingDetails?.fullName || patient?.name || "Valued Patient",
      phone: order.shippingDetails?.phone || patient?.phone || "",
      receiverName: order.shippingDetails?.receiverName,
      receiverPhone: order.shippingDetails?.receiverPhone,
      items: formattedItems,
      itemsSubtotal: pricing.itemsTotal,
      taxAmount: pricing.taxAmount,
      deliveryCharge: pricing.deliveryCharge,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod || "Online",
      shippingAddress: order.shippingAddress || (order.shippingDetails ? `${order.shippingDetails.street}, ${order.shippingDetails.city} - ${order.shippingDetails.pinCode}` : "Akola, Maharashtra"),
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: recipientEmail,
      subject,
      html,
    });

    console.log(`[Mail Service] Successfully sent medicine delivery receipt email to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error(`[Mail Service] Error sending order receipt email:`, error);
    return false;
  }
}

/**
 * 3. Send Instant Welcome Email to New Patient
 */
export async function sendPatientWelcomeEmail(patientId: string): Promise<boolean> {
  try {
    const transporter = (await getMailTransporterAsync()) || getMailTransporter();
    const config = await getResolvedMailConfig();
    if (!transporter) return false;

    await connectDB();
    const patient = await PatientModel.findById(patientId).exec();
    if (!patient || !isValidCustomerNotificationEmail(patient.email)) {
      return false;
    }

    const { subject, html } = generatePatientWelcomeEmail({
      patientName: patient.name,
      email: patient.email,
      phone: patient.phone,
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: patient.email,
      subject,
      html,
      attachments: getMailLogoAttachment(),
    });

    console.log(`[Mail Service] Successfully sent welcome email to ${patient.email}`);
    return true;
  } catch (error) {
    console.error(`[Mail Service] Error sending welcome email:`, error);
    return false;
  }
}

/**
 * 4. Generate & Send Consolidated Daily Executive Report to Admin
 * (kelkarmanashealthcare@gmail.com)
 */
export async function sendDailyAdminReport(): Promise<{ success: boolean; message: string; data?: Record<string, unknown> }> {
  try {
    const transporter = (await getMailTransporterAsync()) || getMailTransporter();
    const config = await getResolvedMailConfig();

    if (!transporter) {
      return {
        success: false,
        message: "Hostinger SMTP is not yet configured. Please set SMTP_USER and SMTP_PASS in your environment.",
      };
    }

    await connectDB();

    // Time calculations in IST (Asia/Kolkata)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Compute Tomorrow's Date string in YYYY-MM-DD
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowsDateStr = tomorrow.toISOString().split("T")[0];

    // 1. Fetch appointments created in the last 24 hours
    const todayBookingsRaw = await AppointmentModel.find({
      createdAt: { $gte: twentyFourHoursAgo },
      deletedAt: null,
    })
      .populate("patientId")
      .populate("doctorId")
      .sort({ createdAt: -1 })
      .exec();

    const todayBookings: DailyReportAppointment[] = (todayBookingsRaw as unknown as RawAppointmentDoc[]).map((b) => ({
      patientName: b.patientId?.name || "Patient",
      patientPhone: b.patientId?.phone,
      doctorName: b.doctorId?.name || "Doctor",
      date: b.date || "",
      time: b.time || "",
      type: b.type || "In-Clinic",
      serviceName: b.serviceName,
      paymentStatus: b.paymentStatus || "Pending",
      feeAmount: b.feeAmount,
    }));

    // 2. Fetch appointments scheduled for tomorrow
    const tomorrowsAptsRaw = await AppointmentModel.find({
      date: tomorrowsDateStr,
      status: { $ne: "Cancelled" },
      deletedAt: null,
    })
      .populate("patientId")
      .populate("doctorId")
      .sort({ time: 1 })
      .exec();

    const tomorrowsSchedule: DailyReportAppointment[] = (tomorrowsAptsRaw as unknown as RawAppointmentDoc[]).map((b) => ({
      patientName: b.patientId?.name || "Patient",
      patientPhone: b.patientId?.phone,
      doctorName: b.doctorId?.name || "Doctor",
      date: b.date || "",
      time: b.time || "",
      type: b.type || "In-Clinic",
      serviceName: b.serviceName,
      paymentStatus: b.paymentStatus || "Pending",
      feeAmount: b.feeAmount,
    }));

    // 3. Fetch medicine orders created in last 24 hours
    const todayOrdersRaw = await OrderModel.find({
      createdAt: { $gte: twentyFourHoursAgo },
      deletedAt: null,
    })
      .populate("patientId")
      .sort({ createdAt: -1 })
      .exec();

    let totalOrderRevenue = 0;
    const todayOrders: DailyReportOrder[] = (todayOrdersRaw as unknown as RawOrderDoc[]).map((o) => {
      totalOrderRevenue += o.totalAmount || 0;
      const itemsList = (o.items || []).map((i: RawOrderItem) => `${i.name || "Item"} (${i.quantity || 1}x)`).join(", ");
      return {
        orderNumber: o.orderNumber || String(o._id),
        patientName: o.shippingDetails?.fullName || o.patientId?.name || "Customer",
        phone: o.shippingDetails?.phone || o.patientId?.phone || "N/A",
        itemsCount: (o.items || []).length,
        itemsSummary: itemsList || "Medicines",
        totalAmount: o.totalAmount || 0,
        paymentMethod: o.paymentMethod || "Online",
        address: o.shippingAddress || (o.shippingDetails ? `${o.shippingDetails.street}, ${o.shippingDetails.city}` : "Akola"),
      };
    });

    // 4. Fetch new patients registered in last 24 hours
    const todayPatientsRaw = await PatientModel.find({
      createdAt: { $gte: twentyFourHoursAgo },
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .exec();

    const todayPatients: DailyReportPatient[] = (todayPatientsRaw as unknown as RawPatientDoc[]).map((p) => ({
      name: p.name,
      email: p.email,
      phone: p.phone,
      createdAt: p.createdAt ? new Date(p.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "",
    }));

    // 5. Fetch contact submissions received in last 24 hours
    const todayInquiriesRaw = await ContactSubmissionModel.find({
      createdAt: { $gte: twentyFourHoursAgo },
    })
      .sort({ createdAt: -1 })
      .exec();

    const todayInquiries: DailyReportInquiry[] = (todayInquiriesRaw as unknown as RawContactInquiry[]).map((inq) => ({
      name: `${inq.firstName || ""} ${inq.lastName || ""}`.trim() || "Visitor",
      email: inq.email || "",
      subject: inq.subject || "General Inquiry",
      message: inq.message || "",
      createdAt: inq.createdAt ? new Date(inq.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "",
    }));

    // Format human-readable date strings
    const reportDateStr = now.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const tomorrowFormattedStr = tomorrow.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    const { subject, html } = generateDailyAdminReportEmail({
      reportDate: reportDateStr,
      tomorrowsDate: tomorrowFormattedStr,
      stats: {
        totalBookingsToday: todayBookings.length,
        tomorrowsAppointmentsCount: tomorrowsSchedule.length,
        totalOrdersToday: todayOrders.length,
        totalOrderRevenueToday: totalOrderRevenue,
        newPatientsCount: todayPatients.length,
        inquiriesCount: todayInquiries.length,
      },
      tomorrowsSchedule,
      todayBookings,
      todayOrders,
      todayPatients,
      todayInquiries,
    });

    await transporter.sendMail({
      from: `"${config.fromName} Digest" <${config.fromEmail}>`,
      to: config.adminEmail,
      subject,
      html,
      attachments: getMailLogoAttachment(),
    });

    console.log(`[Mail Service] Successfully sent Daily Admin Report to ${config.adminEmail}`);

    return {
      success: true,
      message: `Daily report dispatched to ${config.adminEmail}`,
      data: {
        recipient: config.adminEmail,
        totalBookings: todayBookings.length,
        tomorrowsScheduleCount: tomorrowsSchedule.length,
        totalOrders: todayOrders.length,
        orderRevenue: totalOrderRevenue,
        newPatients: todayPatients.length,
        inquiries: todayInquiries.length,
      },
    };
  } catch (error) {
    console.error(`[Mail Service] Error sending daily admin report:`, error);
    const msg = error instanceof Error ? error.message : "Failed to compile daily report.";
    return {
      success: false,
      message: msg,
    };
  }
}

/**
 * Dispatches an instant email notification when a new contact inquiry is submitted.
 * Supports multiple recipient emails (comma-separated in settings), with optional override for tests.
 */
export async function sendContactNotification(
  submission: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
    createdAt?: Date;
  },
  overrideRecipient?: string
): Promise<{ success: boolean; message: string; recipient?: string }> {
  try {
    await connectDB();
    const transporter = (await getMailTransporterAsync()) || getMailTransporter();
    const config = await getResolvedMailConfig();

    let recipientList: string[] = [];

    if (overrideRecipient && overrideRecipient.trim()) {
      recipientList = overrideRecipient
        .split(/[,;\s]+/)
        .map((e: string) => e.trim())
        .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    }

    if (recipientList.length === 0) {
      const emailSetting = await SettingModel.findOne({ key: "contact_notification_email" }).lean();
      const raw: string = emailSetting?.value?.trim() || config.adminEmail || "temptest9093@gmail.com";
      recipientList = raw
        .split(/[,;\s]+/)
        .map((e: string) => e.trim())
        .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    }

    if (recipientList.length === 0) {
      recipientList = ["temptest9093@gmail.com"];
    }

    const recipientString = recipientList.join(", ");

    if (!transporter) {
      console.warn(`[Mail Service] SMTP Transporter not configured. Skipping contact notification email to ${recipientString}.`);
      return {
        success: false,
        message: "SMTP is not configured in environment variables.",
        recipient: recipientString,
      };
    }

    const { subject, html } = generateContactInquiryAdminEmail({
      firstName: submission.firstName,
      lastName: submission.lastName,
      email: submission.email,
      subject: submission.subject,
      message: submission.message,
      submittedAt: submission.createdAt
        ? new Date(submission.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        : undefined,
    });

    await transporter.sendMail({
      from: `"${config.fromName} Inquiries" <${config.fromEmail}>`,
      to: recipientList,
      replyTo: submission.email,
      subject,
      html,
      attachments: getMailLogoAttachment(),
    });

    console.log(`[Mail Service] Successfully dispatched contact notification to ${recipientString}`);
    return {
      success: true,
      message: `Notification sent to ${recipientString}`,
      recipient: recipientString,
    };
  } catch (error) {
    console.error("[Mail Service] Error sending contact inquiry notification:", error);
    const msg = error instanceof Error ? error.message : "Failed to send contact notification.";
    return {
      success: false,
      message: msg,
    };
  }
}

/**
 * 6. Send Medicine Order Request Notifications:
 * Dispatches notification emails to:
 * 1. Respective Clinic Pharmacy (clinic.email)
 * 2. Clinic Admin (config.adminEmail / setting)
 */
export async function sendMedicineOrderRequestNotifications(orderId: string): Promise<{
  success: boolean;
  pharmacySent?: boolean;
  adminSent?: boolean;
  error?: string;
}> {
  try {
    await connectDB();
    const transporter = (await getMailTransporterAsync()) || getMailTransporter();
    const config = await getResolvedMailConfig();

    if (!transporter) {
      console.warn(`[Mail Service] SMTP not configured. Skipping medicine order request emails for Order ${orderId}.`);
      return { success: false, error: "SMTP not configured" };
    }

    const order = await OrderModel.findById(orderId)
      .populate("patientId")
      .populate("clinicId")
      .populate({
        path: "consultationId",
        populate: { path: "doctorId" }
      })
      .exec();

    if (!order) {
      console.warn(`[Mail Service] Order ${orderId} not found.`);
      return { success: false, error: "Order not found" };
    }

    const patient = order.patientId as unknown as PopulatedRef;
    const clinic = order.clinicId as unknown as PopulatedRef;
    const consult = order.consultationId as unknown as { doctorId?: PopulatedRef };
    const doctor = consult?.doctorId;

    const patientName = order.shippingDetails?.fullName || patient?.name || "Patient";
    const patientPhone = order.shippingDetails?.phone || patient?.phone || "Not Provided";
    const patientEmail = isValidCustomerNotificationEmail(patient?.email) ? patient?.email : undefined;

    const clinicName = clinic?.name || "Kelkar Manas Health Care";
    const clinicEmail = clinic?.email;
    const clinicAddress = clinic?.address ? `${clinic.address}, ${clinic.city || ""}` : undefined;
    const doctorName = doctor?.name;
    const orderNumber = order.orderNumber || `#${order._id.toString().slice(-6)}`;

    // Extract medicines from items
    const medicines: MedicineOrderItemData[] = (order.items || []).map((item: RawOrderItem) => ({
      name: item.name || "Medication",
      dosage: item.dosage,
      quantity: item.quantity || 1,
    }));

    let pharmacySent = false;
    let adminSent = false;

    // 1. Send to Respective Clinic Pharmacy
    if (clinicEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clinicEmail.trim())) {
      const pharmacyEmailData = generateMedicineOrderRequestEmail({
        orderNumber,
        recipientType: "PHARMACY",
        clinicName,
        clinicAddress,
        doctorName,
        patientName,
        patientPhone,
        patientEmail,
        medicines,
        portalUrl: "https://kelkarmanasclinic.com/pharmacy/orders",
      });

      await transporter.sendMail({
        from: `"${config.fromName} Pharmacy Network" <${config.fromEmail}>`,
        to: clinicEmail.trim(),
        subject: pharmacyEmailData.subject,
        html: pharmacyEmailData.html,
        attachments: getMailLogoAttachment(),
      });
      pharmacySent = true;
      console.log(`[Mail Service] Dispatched medicine order request notification to clinic pharmacy: ${clinicEmail}`);
    }

    // 2. Send to Admin
    const emailSetting = await SettingModel.findOne({ key: "contact_notification_email" }).lean();
    const adminRecipientsRaw: string = emailSetting?.value?.trim() || config.adminEmail || "support@kelkarmanasclinic.com";
    const adminRecipients = adminRecipientsRaw
      .split(/[,;\s]+/)
      .map((e: string) => e.trim())
      .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (adminRecipients.length > 0) {
      const adminEmailData = generateMedicineOrderRequestEmail({
        orderNumber,
        recipientType: "ADMIN",
        clinicName,
        clinicAddress,
        doctorName,
        patientName,
        patientPhone,
        patientEmail,
        medicines,
        portalUrl: "https://kelkarmanasclinic.com/admin/orders",
      });

      await transporter.sendMail({
        from: `"${config.fromName} Order Desk" <${config.fromEmail}>`,
        to: adminRecipients,
        subject: adminEmailData.subject,
        html: adminEmailData.html,
        attachments: getMailLogoAttachment(),
      });
      adminSent = true;
      console.log(`[Mail Service] Dispatched medicine order request notification to admin: ${adminRecipients.join(", ")}`);
    }

    return { success: true, pharmacySent, adminSent };
  } catch (error) {
    console.error("[Mail Service] Error sending medicine order request emails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
