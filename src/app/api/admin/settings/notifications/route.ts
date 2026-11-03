import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { SettingModel } from "@/modules/system/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { 
  getResolvedMailConfig, 
  resetMailTransporterCache, 
  verifySmtpConnectionWithConfig,
  getMailTransporterAsync,
  getMailLogoAttachment
} from "@/lib/mail/transporter";
import { sendContactNotification } from "@/lib/mail/service";
import { generatePatientWelcomeEmail } from "@/lib/mail/templates/welcome";
import { generateAppointmentCustomerEmail } from "@/lib/mail/templates/appointment";
import { generateOrderCustomerEmail } from "@/lib/mail/templates/order";
import { generateContactInquiryAdminEmail } from "@/lib/mail/templates/contact";
import { generateDailyAdminReportEmail } from "@/lib/mail/templates/daily-admin-report";

export const dynamic = "force-dynamic";

const DEFAULT_NOTIFICATION_EMAIL = "temptest9093@gmail.com";

// GET current contact notification and SMTP configuration settings
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !["SUPER_ADMIN", "ADMIN", "CLINIC_ADMIN", "CLINIC_MANAGER"].includes(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const config = await getResolvedMailConfig();
    const isSmtpConfigured = Boolean(config.user && config.pass);

    return NextResponse.json({
      success: true,
      data: {
        contactNotificationEmail: config.adminEmail || DEFAULT_NOTIFICATION_EMAIL,
        smtpHost: config.host || "smtp.hostinger.com",
        smtpPort: config.port || 465,
        smtpSecure: config.secure,
        smtpUser: config.user || "",
        smtpFromName: config.fromName || "Kelkar Manas Health Care",
        smtpFromEmail: config.fromEmail || "support@kelkarmanasclinic.com",
        hasSmtpPass: Boolean(config.pass),
        isSmtpConfigured,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load notification settings.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT update contact notification email and/or SMTP settings
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !["SUPER_ADMIN", "ADMIN", "CLINIC_ADMIN", "CLINIC_MANAGER"].includes(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    const updates: { key: string; value: string; category: string }[] = [];

    // 1. Contact Notification Email (Multiple supported via comma separation)
    if (typeof body.contactNotificationEmail === "string") {
      const raw = body.contactNotificationEmail.trim().toLowerCase();
      if (raw) {
        const emailList = raw.split(/[,;\s]+/).map((e: string) => e.trim()).filter(Boolean);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const em of emailList) {
          if (!emailRegex.test(em)) {
            return NextResponse.json({ 
              success: false, 
              message: `Invalid email address format: "${em}". Please enter valid email addresses separated by commas.` 
            }, { status: 400 });
          }
        }
        const unique = Array.from(new Set(emailList));
        updates.push({ key: "contact_notification_email", value: unique.join(", "), category: "notifications" });
      }
    }

    // 2. SMTP Host
    if (typeof body.smtpHost === "string" && body.smtpHost.trim()) {
      updates.push({ key: "smtp_host", value: body.smtpHost.trim(), category: "smtp" });
    }

    // 3. SMTP Port
    if (body.smtpPort !== undefined && body.smtpPort !== null) {
      const port = Number(body.smtpPort);
      if (isNaN(port) || port <= 0) {
        return NextResponse.json({ success: false, message: "Invalid SMTP port number." }, { status: 400 });
      }
      updates.push({ key: "smtp_port", value: String(port), category: "smtp" });
    }

    // 4. SMTP Secure (SSL/TLS)
    if (body.smtpSecure !== undefined) {
      updates.push({ key: "smtp_secure", value: body.smtpSecure ? "true" : "false", category: "smtp" });
    }

    // 5. SMTP Username
    if (typeof body.smtpUser === "string") {
      updates.push({ key: "smtp_user", value: body.smtpUser.trim(), category: "smtp" });
    }

    // 6. SMTP Password (only update if a non-empty string is provided)
    if (typeof body.smtpPass === "string" && body.smtpPass.trim()) {
      updates.push({ key: "smtp_pass", value: body.smtpPass.trim(), category: "smtp" });
    }

    // 7. Sender Name
    if (typeof body.smtpFromName === "string" && body.smtpFromName.trim()) {
      updates.push({ key: "smtp_from_name", value: body.smtpFromName.trim(), category: "smtp" });
    }

    // 8. Sender From Email
    if (typeof body.smtpFromEmail === "string" && body.smtpFromEmail.trim()) {
      const fromEmail = body.smtpFromEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(fromEmail)) {
        return NextResponse.json({ success: false, message: "Please enter a valid sender From email." }, { status: 400 });
      }
      updates.push({ key: "smtp_from_email", value: fromEmail, category: "smtp" });
    }

    // Upsert all modified keys in database
    for (const item of updates) {
      await SettingModel.findOneAndUpdate(
        { key: item.key },
        { value: item.value, category: item.category },
        { upsert: true, new: true }
      );
    }

    // Invalidate cached transporter so fresh config is applied
    resetMailTransporterCache();

    const freshConfig = await getResolvedMailConfig();

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully.",
      data: {
        contactNotificationEmail: freshConfig.adminEmail,
        smtpHost: freshConfig.host,
        smtpPort: freshConfig.port,
        smtpSecure: freshConfig.secure,
        smtpUser: freshConfig.user,
        smtpFromName: freshConfig.fromName,
        smtpFromEmail: freshConfig.fromEmail,
        hasSmtpPass: Boolean(freshConfig.pass),
        isSmtpConfigured: Boolean(freshConfig.user && freshConfig.pass),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update notification settings.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST test SMTP connection or test contact inquiry notification
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !["SUPER_ADMIN", "ADMIN", "CLINIC_ADMIN", "CLINIC_MANAGER"].includes(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "test_smtp";

    const config = await getResolvedMailConfig();

    if (action === "test_smtp") {
      // Allow overriding with form values for real-time connection testing before saving
      const testConfig = {
        host: body.smtpHost || config.host,
        port: body.smtpPort ? Number(body.smtpPort) : config.port,
        secure: body.smtpSecure !== undefined ? Boolean(body.smtpSecure) : config.secure,
        user: body.smtpUser || config.user,
        pass: body.smtpPass || config.pass,
      };

      const verification = await verifySmtpConnectionWithConfig(testConfig);
      if (!verification.success) {
        return NextResponse.json(verification, { status: 400 });
      }

      // Also send a live verification email if requested or if recipient is available
      const targetEmail = body.email || config.adminEmail || DEFAULT_NOTIFICATION_EMAIL;
      const transporter = await getMailTransporterAsync();
      if (transporter && targetEmail) {
        try {
          await transporter.sendMail({
            from: `"${config.fromName}" <${config.fromEmail}>`,
            to: targetEmail,
            subject: `[SMTP Test] Connection Verified - ${config.fromName}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; color: #2D242D; background-color: #FAF7F9; border-radius: 12px; border: 1px solid #ECE4EB;">
                <h2 style="color: #2E7D32; margin-top: 0;">✓ SMTP Connection Successful!</h2>
                <p>This email confirms that your outgoing mail server configuration is active and working correctly for <strong>${config.fromName}</strong>.</p>
                <div style="background: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid #ECE4EB; font-size: 13px;">
                  <p style="margin: 4px 0;"><strong>Server:</strong> ${testConfig.host}:${testConfig.port}</p>
                  <p style="margin: 4px 0;"><strong>Security:</strong> ${testConfig.secure ? "SSL" : "TLS / STARTTLS"}</p>
                  <p style="margin: 4px 0;"><strong>Username:</strong> ${testConfig.user}</p>
                  <p style="margin: 4px 0;"><strong>Sender:</strong> ${config.fromEmail}</p>
                </div>
                <p style="font-size: 11px; color: #8F7D8F; margin-top: 16px;">Test dispatched to: ${targetEmail}</p>
              </div>
            `,
          });
          return NextResponse.json({
            success: true,
            message: `${verification.message} A test verification email was also delivered to ${targetEmail}.`,
          });
        } catch (mailErr: any) {
          return NextResponse.json({
            success: true,
            message: `${verification.message} (Note: Test email dispatch warning: ${mailErr.message})`,
          });
        }
      }

      return NextResponse.json(verification);
    }

    if (action === "test_contact") {
      const recipient = body.email || config.adminEmail || DEFAULT_NOTIFICATION_EMAIL;
      const result = await sendContactNotification({
        firstName: "Test",
        lastName: "Inquirer",
        email: "test.visitor@example.com",
        subject: "Website Contact Form - Owner Verification Test",
        message: "This is a test notification dispatched from the Kelkar Manas Health Care Admin Panel to verify that the owner notification recipient is receiving contact form inquiries.",
        createdAt: new Date(),
      }, recipient);

      if (!result.success) {
        return NextResponse.json({
          success: false,
          message: result.message,
          recipient,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Test contact notification successfully delivered to ${result.recipient || recipient}!`,
        recipient: result.recipient || recipient,
      });
    }

    if (action === "test_all") {
      const rawTarget = body.email || config.adminEmail || DEFAULT_NOTIFICATION_EMAIL;
      const targetEmails = rawTarget
        .split(/[,;\s]+/)
        .map((e: string) => e.trim())
        .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      const recipients = targetEmails.length > 0 ? targetEmails : [rawTarget];
      const targetString = recipients.join(", ");

      const transporter = await getMailTransporterAsync();
      if (!transporter) {
        return NextResponse.json({
          success: false,
          message: "SMTP is not fully configured. Please ensure SMTP user and password are saved.",
        }, { status: 400 });
      }

      const results: string[] = [];

      // 1. Patient Welcome Email
      try {
        const welcome = generatePatientWelcomeEmail({
          patientName: "Ahmed Sana (Test)",
          email: recipients[0] || rawTarget,
          phone: "9422861000",
          portalUrl: "https://kelkarmanasclinic.com/patient/dashboard",
        });
        await transporter.sendMail({
          from: `"${config.fromName}" <${config.fromEmail}>`,
          to: recipients,
          subject: `[Test 1/5] ${welcome.subject}`,
          html: welcome.html,
          attachments: getMailLogoAttachment(),
        });
        results.push("1. Patient Welcome Email");
      } catch (e: any) {
        console.error("Failed test 1:", e);
      }

      // 2. Appointment Booking Confirmation
      try {
        const apt = generateAppointmentCustomerEmail({
          patientName: "Ahmed Sana (Test)",
          doctorName: "Dr. Suyog Kelkar",
          doctorSpecialization: "Chief Consultant Psychiatrist & Sexologist",
          clinicName: "Kelkar Manas Health Care",
          clinicAddress: "Civil Lines, Akola",
          date: "Wednesday, 4 November 2026",
          time: "11:30 AM",
          type: "Video",
          serviceName: "Sexual Wellness & Intimacy Counseling",
          feeAmount: 1000,
          paymentStatus: "Completed",
          dashboardUrl: "https://kelkarmanasclinic.com/patient/appointments",
        });
        await transporter.sendMail({
          from: `"${config.fromName}" <${config.fromEmail}>`,
          to: recipients,
          subject: `[Test 2/5] ${apt.subject}`,
          html: apt.html,
          attachments: getMailLogoAttachment(),
        });
        results.push("2. Appointment Confirmation");
      } catch (e: any) {
        console.error("Failed test 2:", e);
      }

      // 3. Medicine / Pharmacy Order
      try {
        const order = generateOrderCustomerEmail({
          orderNumber: "ORD-2026-90412",
          patientName: "Ahmed Sana (Test)",
          phone: "+91 94228 61000",
          items: [
            { name: "TRP PLUS TAB", quantity: 1, price: 340, dosage: "1 Tab Night", isPrescription: true },
            { name: "WELLFIRE 50 TAB", quantity: 1, price: 280, dosage: "SOS As advised", isPrescription: true },
          ],
          itemsSubtotal: 620,
          taxAmount: 0,
          deliveryCharge: 0,
          totalAmount: 620,
          paymentMethod: "Online (Razorpay)",
          shippingAddress: "Civil Lines, Akola, Maharashtra 444001",
          estimatedDelivery: "Same Day Dispatch (Within 24 Hours)",
        });
        await transporter.sendMail({
          from: `"${config.fromName}" <${config.fromEmail}>`,
          to: recipients,
          subject: `[Test 3/5] ${order.subject}`,
          html: order.html,
          attachments: getMailLogoAttachment(),
        });
        results.push("3. Medicine Order Confirmation");
      } catch (e: any) {
        console.error("Failed test 3:", e);
      }

      // 4. Contact Form Inquiry Notification
      try {
        const contact = generateContactInquiryAdminEmail({
          firstName: "Rajesh",
          lastName: "Sharma",
          email: "rajesh.sharma@example.com",
          subject: "Inquiry regarding sexual wellness and therapy slots",
          message: "Hello Dr. Kelkar team, I would like to know if weekend therapy slots are available for shockwave therapy in Akola clinic, and what is the typical procedure for the first visit? Thank you.",
          submittedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          adminPortalUrl: "https://kelkarmanasclinic.com/admin/contact",
        });
        await transporter.sendMail({
          from: `"${config.fromName}" <${config.fromEmail}>`,
          to: recipients,
          subject: `[Test 4/5] ${contact.subject}`,
          html: contact.html,
          attachments: getMailLogoAttachment(),
        });
        results.push("4. Contact Form Inquiry Notification");
      } catch (e: any) {
        console.error("Failed test 4:", e);
      }

      // 5. Daily Operations Executive Report
      try {
        const report = generateDailyAdminReportEmail({
          reportDate: new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          tomorrowsDate: new Date(Date.now() + 86400000).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          stats: {
            totalBookingsToday: 12,
            tomorrowsAppointmentsCount: 9,
            totalOrdersToday: 8,
            totalOrderRevenueToday: 6450,
            newPatientsCount: 5,
            inquiriesCount: 3,
          },
          tomorrowsSchedule: [
            { patientName: "Patient 8104", patientPhone: "9422861000", doctorName: "Dr. Suyog Kelkar", date: "Tomorrow", time: "11:30 AM", type: "Walk-in", serviceName: "Follow-up" },
          ],
          todayBookings: [
            { patientName: "Patient 7922", patientPhone: "8261067922", doctorName: "Dr. Suyog Kelkar", date: "Today", time: "10:00 AM", type: "Video", serviceName: "Consultation" },
          ],
          todayOrders: [
            { orderNumber: "ORD-2026-90412", patientName: "Patient 7922", phone: "8261067922", itemsCount: 2, itemsSummary: "TRP PLUS TAB, WELLFIRE 50 TAB", totalAmount: 620, address: "Akola" },
          ],
          todayPatients: [
            { name: "Patient 7922", phone: "8261067922", createdAt: "Today" },
          ],
          todayInquiries: [
            { name: "Rajesh Sharma", email: "rajesh@example.com", subject: "Clinic slots", message: "Inquiry details...", createdAt: "Today" },
          ],
        });
        await transporter.sendMail({
          from: `"${config.fromName}" <${config.fromEmail}>`,
          to: recipients,
          subject: `[Test 5/5] ${report.subject}`,
          html: report.html,
          attachments: getMailLogoAttachment(),
        });
        results.push("5. Daily Executive Operations Report");
      } catch (e: any) {
        console.error("Failed test 5:", e);
      }

      return NextResponse.json({
        success: true,
        message: `All ${results.length} email templates were successfully dispatched to ${targetString}!`,
        deliveredTemplates: results,
        recipient: targetString,
      });
    }

    return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process request.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
