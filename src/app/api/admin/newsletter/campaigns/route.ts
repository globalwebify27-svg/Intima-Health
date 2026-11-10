import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/db/connect";
import { NewsletterCampaignModel, NewsletterSubscriberModel } from "@/modules/newsletter/schema";
import { getAuthToken, verifyJwt } from "@/lib/jwt";
import {
  createNewsletterTransporter,
  getNewsletterMailConfig,
  getPublicAppBaseUrl,
  sendSingleNewsletterEmail,
} from "@/lib/mail/newsletter";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

    await connectDB();

    const [campaigns, config] = await Promise.all([
      NewsletterCampaignModel.find().sort({ createdAt: -1 }).lean().exec(),
      getNewsletterMailConfig(),
    ]);

    return NextResponse.json({
      success: true,
      data: campaigns,
      senderConfig: {
        senderName: config.senderName,
        senderEmail: config.senderEmail,
        replyToEmail: config.replyToEmail,
        smtpConfigured: config.smtpConfigured,
        hasSeparateNewsletterAuth: config.hasSeparateNewsletterAuth,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load newsletter campaigns" },
      { status: 500 }
    );
  }
}

const campaignActionSchema = z.object({
  action: z.enum(["save_draft", "send_test", "send_campaign"]),
  campaignId: z.string().optional(),
  subject: z.string().min(1, "Newsletter subject is required."),
  htmlContent: z.string().min(1, "Newsletter content is required."),
  testEmail: z.string().email("Please enter a valid test email address.").optional(),
});

export async function POST(req: Request) {
  try {
    const token = await getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload || !isAdminRole(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = campaignActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const config = await getNewsletterMailConfig();
    const baseUrl = getPublicAppBaseUrl(req);
    const { action, campaignId, subject, htmlContent, testEmail } = parsed.data;

    // 1. Save Draft
    if (action === "save_draft") {
      let campaign;
      if (campaignId) {
        campaign = await NewsletterCampaignModel.findOneAndUpdate(
          { _id: campaignId, status: "Draft" },
          {
            $set: {
              subject: subject.trim(),
              htmlContent,
              senderName: config.senderName,
              senderEmail: config.senderEmail,
              replyTo: config.replyToEmail,
            },
          },
          { new: true }
        ).exec();
      }

      if (!campaign) {
        campaign = await NewsletterCampaignModel.create({
          subject: subject.trim(),
          htmlContent,
          senderName: config.senderName,
          senderEmail: config.senderEmail,
          replyTo: config.replyToEmail,
          status: "Draft",
          createdBy: payload.email,
        });
      }

      return NextResponse.json({
        success: true,
        data: campaign,
        message: "Newsletter draft saved.",
      });
    }

    // Validate SMTP transporter for test / live sending
    const transporter = createNewsletterTransporter(config);
    if (!transporter) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business SMTP email is not configured. Please configure SMTP credentials under Settings or Sender Settings before sending.",
        },
        { status: 400 }
      );
    }

    // 2. Send Test Email
    if (action === "send_test") {
      if (!testEmail) {
        return NextResponse.json({ success: false, message: "Test email address is required." }, { status: 400 });
      }

      try {
        await sendSingleNewsletterEmail({
          transporter,
          config,
          toEmail: testEmail.trim().toLowerCase(),
          subject: subject.trim(),
          contentHtml: htmlContent,
          unsubscribeUrl: `${baseUrl}/newsletter/unsubscribe?token=preview-test-token`,
          baseUrl,
          isTest: true,
        });

        return NextResponse.json({
          success: true,
          message: `Test email sent to ${testEmail.trim().toLowerCase()} from ${config.senderEmail}.`,
        });
      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            message: `Failed to send test email: ${err?.message || "SMTP error"}`,
          },
          { status: 500 }
        );
      }
    }

    // 3. Send Campaign to ALL Active Subscribers (strictly excluding Unsubscribed)
    const activeSubscribers = await NewsletterSubscriberModel.find({ status: "Active" }).exec();

    if (activeSubscribers.length === 0) {
      return NextResponse.json(
        { success: false, message: "There are no active subscribers to send this newsletter to." },
        { status: 400 }
      );
    }

    // Create or transition Draft -> Sending
    let campaign;
    if (campaignId) {
      campaign = await NewsletterCampaignModel.findByIdAndUpdate(
        campaignId,
        {
          $set: {
            subject: subject.trim(),
            htmlContent,
            senderName: config.senderName,
            senderEmail: config.senderEmail,
            replyTo: config.replyToEmail,
            totalRecipients: activeSubscribers.length,
            successCount: 0,
            failedCount: 0,
            failedRecipients: [],
            status: "Sending",
          },
        },
        { new: true }
      ).exec();
    }

    if (!campaign) {
      campaign = await NewsletterCampaignModel.create({
        subject: subject.trim(),
        htmlContent,
        senderName: config.senderName,
        senderEmail: config.senderEmail,
        replyTo: config.replyToEmail,
        totalRecipients: activeSubscribers.length,
        successCount: 0,
        failedCount: 0,
        failedRecipients: [],
        status: "Sending",
        createdBy: payload.email,
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const failedRecipients: { email: string; error: string }[] = [];

    // Send strictly 1-to-1 in batches of 5 to respect SMTP rate limits & keep subscriber emails private
    const BATCH_SIZE = 5;
    for (let i = 0; i < activeSubscribers.length; i += BATCH_SIZE) {
      const batch = activeSubscribers.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (sub) => {
          try {
            if (!sub.unsubscribeToken) {
              sub.unsubscribeToken = crypto.randomBytes(24).toString("hex");
              await sub.save();
            }

            const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(
              sub.unsubscribeToken
            )}`;

            await sendSingleNewsletterEmail({
              transporter,
              config,
              toEmail: sub.email,
              subject: subject.trim(),
              contentHtml: htmlContent,
              unsubscribeUrl,
              baseUrl,
              isTest: false,
            });
            successCount += 1;
          } catch (err: any) {
            failedCount += 1;
            failedRecipients.push({
              email: sub.email,
              error: err?.message || "Delivery failed",
            });
          }
        })
      );
    }

    const finalStatus = successCount > 0 ? "Sent" : "Failed";
    campaign.successCount = successCount;
    campaign.failedCount = failedCount;
    campaign.failedRecipients = failedRecipients;
    campaign.status = finalStatus;
    campaign.sentAt = new Date();
    await campaign.save();

    return NextResponse.json({
      success: finalStatus === "Sent",
      data: campaign,
      message:
        finalStatus === "Sent"
          ? `Campaign sent to ${successCount} of ${activeSubscribers.length} active subscriber(s).${
              failedCount > 0 ? ` (${failedCount} failed)` : ""
            }`
          : `Campaign delivery failed for all ${failedCount} recipient(s). Please verify SMTP credentials.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process newsletter campaign." },
      { status: 500 }
    );
  }
}

