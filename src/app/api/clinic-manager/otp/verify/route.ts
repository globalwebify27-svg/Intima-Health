import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { OtpModel } from "@/modules/auth/otp";

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

    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone number and 6-digit OTP code are required." },
        { status: 400 }
      );
    }

    const digits = phone.replace(/\D/g, "");
    const last10 = digits.slice(-10);

    const otpRecord = await OtpModel.findOne({ phone: last10 }).exec();
    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "OTP expired or not found. Please request a new code." },
        { status: 400 }
      );
    }

    if (otpRecord.code !== otp.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // OTP is valid - remove used OTP record
    await OtpModel.deleteOne({ _id: otpRecord._id });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully!",
      verifiedPhone: last10,
    });
  } catch (error: any) {
    console.error("[ClinicManager OTP Verify Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify OTP." },
      { status: 500 }
    );
  }
}
