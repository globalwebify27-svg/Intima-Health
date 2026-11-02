import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { SettingModel } from "@/modules/system/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { 
  getResolvedMailConfig, 
  resetMailTransporterCache, 
  verifySmtpConnectionWithConfig,
  getMailTransporterAsync
} from "@/lib/mail/transporter";
import { sendContactNotification } from "@/lib/mail/service";

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
        smtpFromEmail: config.fromEmail || "care@kelkarmanas.com",
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

    // 1. Contact Notification Email
    if (typeof body.contactNotificationEmail === "string") {
      const email = body.contactNotificationEmail.trim().toLowerCase();
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return NextResponse.json({ success: false, message: "Please enter a valid notification email address." }, { status: 400 });
        }
        updates.push({ key: "contact_notification_email", value: email, category: "notifications" });
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
      });

      if (!result.success) {
        return NextResponse.json({
          success: false,
          message: result.message,
          recipient,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Test contact notification successfully delivered to ${recipient}!`,
        recipient,
      });
    }

    return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process request.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
