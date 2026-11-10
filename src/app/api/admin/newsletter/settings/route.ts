import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { SettingModel } from "@/modules/system/schema";
import { getAuthToken, verifyJwt } from "@/lib/jwt";
import {
  checkDomainEmailAuth,
  createNewsletterTransporter,
  getNewsletterMailConfig,
} from "@/lib/mail/newsletter";

export const dynamic = "force-dynamic";

function isAdminRole(role?: string) {
  return role === "SUPER_ADMIN" || role === "CLINIC_ADMIN";
}

export async function GET(req: Request) {
  try {
    const token = await getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload || !isAdminRole(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const checkDns = searchParams.get("checkDns") === "true";

    const config = await getNewsletterMailConfig();
    const dnsAuth = checkDns ? await checkDomainEmailAuth(config.senderEmail) : undefined;

    return NextResponse.json({
      success: true,
      data: {
        senderName: config.senderName,
        senderEmail: config.senderEmail,
        replyToEmail: config.replyToEmail,
        smtpHost: config.host,
        smtpPort: config.port,
        smtpUser: config.smtpUser || "",
        hasSeparateNewsletterAuth: config.hasSeparateNewsletterAuth,
        smtpConfigured: config.smtpConfigured,
        dnsAuth,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load newsletter settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const token = await getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload || !isAdminRole(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const updates: { key: string; value: string; category: string }[] = [];

    if (typeof body.senderName === "string" && body.senderName.trim()) {
      updates.push({ key: "newsletter_from_name", value: body.senderName.trim(), category: "newsletter" });
    }

    if (typeof body.senderEmail === "string" && body.senderEmail.trim()) {
      const email = body.senderEmail.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, message: "Invalid newsletter sender email." }, { status: 400 });
      }
      updates.push({ key: "newsletter_from_email", value: email, category: "newsletter" });
    }

    if (typeof body.replyToEmail === "string" && body.replyToEmail.trim()) {
      const replyEmail = body.replyToEmail.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyEmail)) {
        return NextResponse.json({ success: false, message: "Invalid reply-to email." }, { status: 400 });
      }
      updates.push({ key: "newsletter_reply_to", value: replyEmail, category: "newsletter" });
    }

    if (body.clearSeparateAuth === true) {
      await SettingModel.deleteMany({
        key: { $in: ["newsletter_smtp_user", "newsletter_smtp_pass"] },
      }).exec();
    } else {
      if (typeof body.newsletterSmtpUser === "string" && body.newsletterSmtpUser.trim()) {
        updates.push({
          key: "newsletter_smtp_user",
          value: body.newsletterSmtpUser.trim(),
          category: "newsletter",
        });
      }
      if (typeof body.newsletterSmtpPass === "string" && body.newsletterSmtpPass.trim()) {
        updates.push({
          key: "newsletter_smtp_pass",
          value: body.newsletterSmtpPass.trim(),
          category: "newsletter",
        });
      }
    }

    for (const u of updates) {
      await SettingModel.findOneAndUpdate(
        { key: u.key },
        { $set: { value: u.value, category: u.category } },
        { upsert: true, new: true }
      ).exec();
    }

    const freshConfig = await getNewsletterMailConfig();

    // Optionally verify SMTP handshake if requested
    let verifyStatus: { success: boolean; message: string } | undefined;
    if (body.verifyConnection) {
      const transporter = createNewsletterTransporter(freshConfig);
      if (!transporter) {
        verifyStatus = { success: false, message: "SMTP credentials are incomplete." };
      } else {
        try {
          await transporter.verify();
          verifyStatus = { success: true, message: "SMTP authentication verified for newsletter sender." };
        } catch (err: any) {
          verifyStatus = { success: false, message: err?.message || "SMTP verification failed." };
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Newsletter sender configuration saved.",
      verifyStatus,
      data: {
        senderName: freshConfig.senderName,
        senderEmail: freshConfig.senderEmail,
        replyToEmail: freshConfig.replyToEmail,
        smtpHost: freshConfig.host,
        smtpPort: freshConfig.port,
        smtpUser: freshConfig.smtpUser || "",
        hasSeparateNewsletterAuth: freshConfig.hasSeparateNewsletterAuth,
        smtpConfigured: freshConfig.smtpConfigured,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save newsletter settings" },
      { status: 500 }
    );
  }
}

