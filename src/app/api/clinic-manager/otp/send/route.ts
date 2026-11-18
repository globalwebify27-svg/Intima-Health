import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { OtpModel } from "@/modules/auth/otp";
import { sendWhatsAppOtp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || (payload.role !== "CLINIC_MANAGER" && payload.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Clinic Manager access required." },
        { status: 403 }
      );
    }

    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number is required." }, { status: 400 });
    }

    const digits = phone.replace(/\D/g, "");
    const last10 = digits.slice(-10);

    if (last10.length < 10) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Generate 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database with 5 minutes TTL
    await OtpModel.deleteMany({ phone: last10 });
    await OtpModel.create({
      phone: last10,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send WhatsApp OTP via AiSensy
    const aiSensyResponse = await sendWhatsAppOtp({ phone: last10, code });

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${last10} via WhatsApp.`,
      debug: aiSensyResponse,
    });
  } catch (error: any) {
    console.error("[ClinicManager OTP Send Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send OTP." },
      { status: 500 }
    );
  }
}
