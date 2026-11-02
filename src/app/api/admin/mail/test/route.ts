import { NextResponse } from "next/server";
import { getMailTransporter, getMailConfig, verifySmtpConnection } from "@/lib/mail/transporter";
import { getAuthToken, verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const token = await getAuthToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const payload = verifyJwt(token);
    if (!payload || (payload.role !== "SUPER_ADMIN" && payload.role !== "CLINIC_ADMIN")) {
      return NextResponse.json({ success: false, message: "Admin authorization required." }, { status: 403 });
    }

    const verification = await verifySmtpConnection();
    if (!verification.success) {
      return NextResponse.json(verification, { status: 400 });
    }

    const transporter = getMailTransporter();
    const config = getMailConfig();

    if (!transporter) {
      return NextResponse.json({ success: false, message: "Transporter not available." }, { status: 500 });
    }

    // Send test email to admin
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: config.adminEmail,
      subject: `Hostinger SMTP Test Email - Kelkar Manas Health Care`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #2D242D;">
          <h2 style="color: #7A2E7A;">Hostinger SMTP Connected Successfully!</h2>
          <p>This is a test notification confirming that Hostinger business email (${config.fromEmail}) is configured and active for <strong>Kelkar Manas Health Care</strong>.</p>
          <p>Transactional patient confirmations and daily executive digests will be delivered through this channel.</p>
          <hr style="border: 0; border-top: 1px solid #ECE4EB; margin: 20px 0;">
          <p style="font-size: 12px; color: #8F7D8F;">Sent to admin recipient: ${config.adminEmail}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${config.adminEmail} via Hostinger SMTP (${config.fromEmail})!`,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Test email failed.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

