import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { NewsletterSubscriberModel } from "@/modules/newsletter/schema";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectDB();
    
    // Sort by newest first
    const subscribers = await NewsletterSubscriberModel.find().sort({ createdAt: -1 }).exec();

    return NextResponse.json({
      success: true,
      data: subscribers
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
