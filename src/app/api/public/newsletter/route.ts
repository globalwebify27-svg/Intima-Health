import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { NewsletterSubscriberModel } from "@/modules/newsletter/schema";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const rawBody = await req.json();
    
    const parsed = newsletterSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    let subscriber = await NewsletterSubscriberModel.findOne({ email }).exec();
    
    if (subscriber) {
      if (subscriber.status === "Unsubscribed") {
        subscriber.status = "Active";
        await subscriber.save();
        return NextResponse.json({ success: true, message: "Welcome back! You have been re-subscribed." });
      }
      return NextResponse.json({ success: true, message: "You are already subscribed to our newsletter!" });
    }

    await NewsletterSubscriberModel.create({
      email,
      status: "Active"
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to our newsletter!"
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to subscribe." },
      { status: 500 }
    );
  }
}
