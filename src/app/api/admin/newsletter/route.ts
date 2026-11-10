import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/db/connect";
import { NewsletterSubscriberModel, NewsletterCampaignModel } from "@/modules/newsletter/schema";
import { getAuthToken, verifyJwt } from "@/lib/jwt";
import { z } from "zod";

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

    await connectDB();

    // Ensure any legacy subscribers without unsubscribeToken get one
    const missingTokens = await NewsletterSubscriberModel.find({
      $or: [{ unsubscribeToken: { $exists: false } }, { unsubscribeToken: null }, { unsubscribeToken: "" }],
    }).exec();

    if (missingTokens.length > 0) {
      await Promise.all(
        missingTokens.map((sub) => {
          sub.unsubscribeToken = crypto.randomBytes(24).toString("hex");
          return sub.save();
        })
      );
    }

    const [subscribers, campaignsSentCount] = await Promise.all([
      NewsletterSubscriberModel.find().sort({ createdAt: -1 }).lean().exec(),
      NewsletterCampaignModel.countDocuments({ status: "Sent" }),
    ]);

    const activeCount = subscribers.filter((s) => s.status === "Active").length;
    const unsubscribedCount = subscribers.filter((s) => s.status === "Unsubscribed").length;

    return NextResponse.json({
      success: true,
      data: subscribers,
      stats: {
        total: subscribers.length,
        active: activeCount,
        unsubscribed: unsubscribedCount,
        campaignsSent: campaignsSentCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}

const addSubscriberSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
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
    const parsed = addSubscriberSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();
    const email = parsed.data.email.trim().toLowerCase();
    const existing = await NewsletterSubscriberModel.findOne({ email }).exec();
    if (existing) {
      if (existing.status === "Unsubscribed") {
        existing.status = "Active";
        existing.unsubscribedAt = undefined;
        await existing.save();
        return NextResponse.json({ success: true, data: existing, message: "Subscriber reactivated." });
      }
      return NextResponse.json({ success: false, message: "This email is already an active subscriber." }, { status: 409 });
    }

    const created = await NewsletterSubscriberModel.create({
      email,
      status: "Active",
      unsubscribeToken: crypto.randomBytes(24).toString("hex"),
    });

    return NextResponse.json({ success: true, data: created, message: "Subscriber added." }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add subscriber" },
      { status: 500 }
    );
  }
}
