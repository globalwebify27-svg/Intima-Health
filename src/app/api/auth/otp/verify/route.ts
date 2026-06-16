import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PatientModel } from "@/modules/patients/schema";
import { OtpModel } from "@/modules/auth/otp";
import { UserModel } from "@/modules/auth/schema";
import { signJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ success: false, message: "Phone and verification code are required." }, { status: 400 });
    }

    const digits = phone.replace(/\D/g, "");
    const last10 = digits.slice(-10);

    // Find OTP record
    const otpRecord = await OtpModel.findOne({ phone: last10 }).exec();
    if (!otpRecord) {
      return NextResponse.json({ success: false, message: "Code expired or not found. Please request a new code." }, { status: 400 });
    }

    if (otpRecord.code !== otp) {
      return NextResponse.json({ success: false, message: "Invalid verification code." }, { status: 400 });
    }

    // Find patient profile
    const patient = await PatientModel.findOne({ 
      phone: new RegExp(last10 + '$') 
    }).exec();

    if (!patient) {
      return NextResponse.json({ success: false, message: "Patient profile not found." }, { status: 404 });
    }

    // Clean up OTP record
    await OtpModel.deleteOne({ _id: otpRecord._id });

    // Find or create User credential record
    let user = await UserModel.findOne({ email: patient.email }).exec();
    if (!user) {
      user = await UserModel.create({
        name: patient.name,
        email: patient.email,
        passwordHash: `OTP_LOGIN_ONLY_${Math.random()}`,
        role: "PATIENT",
        status: "Active"
      });
    }

    // Generate JWT
    const token = signJwt({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: patient._id
      }
    });

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400 // 1 day
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify code." },
      { status: 500 }
    );
  }
}
