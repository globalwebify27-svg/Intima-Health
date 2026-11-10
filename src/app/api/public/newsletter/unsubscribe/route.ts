import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { NewsletterSubscriberModel } from "@/modules/newsletter/schema";

export const dynamic = "force-dynamic";

async function processUnsubscribe(token: string) {
  if (!token || token.length < 10) {
    return { ok: false, status: 400, message: "Invalid or missing unsubscribe token." };
  }

  await connectDB();
  const subscriber = await NewsletterSubscriberModel.findOne({ unsubscribeToken: token }).exec();
  if (!subscriber) {
    return { ok: false, status: 404, message: "Subscription record not found." };
  }

  if (subscriber.status !== "Unsubscribed") {
    subscriber.status = "Unsubscribed";
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();
  }

  return {
    ok: true,
    status: 200,
    email: subscriber.email,
    subscriberStatus: subscriber.status,
    message: "You have been unsubscribed from future newsletters.",
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim() || "";
    const result = await processUnsubscribe(token);

    return NextResponse.json(
      {
        success: result.ok,
        email: result.email,
        status: result.subscriberStatus,
        message: result.message,
      },
      { status: result.status }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process unsubscribe request." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let token = searchParams.get("token")?.trim() || "";

    if (!token) {
      const body = await req.json().catch(() => ({}));
      token = typeof body.token === "string" ? body.token.trim() : "";
    }

    const result = await processUnsubscribe(token);
    return NextResponse.json(
      {
        success: result.ok,
        email: result.email,
        status: result.subscriberStatus,
        message: result.message,
      },
      { status: result.status }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process unsubscribe request." },
      { status: 500 }
    );
  }
}

