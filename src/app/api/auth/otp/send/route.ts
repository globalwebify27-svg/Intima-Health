import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PatientModel } from "@/modules/patients/schema";
import { OtpModel } from "@/modules/auth/otp";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number is required." }, { status: 400 });
    }

    // Extract last 10 digits to match database phone formats
    const digits = phone.replace(/\D/g, "");
    const last10 = digits.slice(-10);

    if (last10.length < 10) {
      return NextResponse.json({ success: false, message: "Invalid phone number format." }, { status: 400 });
    }

    // Find patient profile — auto-create if new number
    let patient = await PatientModel.findOne({
      phone: new RegExp(last10 + '$')
    }).exec();

    let isNewPatient = false;

    if (!patient) {
      // Auto-create a minimal patient profile for self-registration
      patient = await PatientModel.create({
        name: `Patient ${last10.slice(-4)}`, // placeholder name, updated later in profile
        email: `${last10}@intima.app`,       // placeholder email, updated later
        phone: last10,
        gender: "Prefer not to say",
        status: "Active",
      });
      isNewPatient = true;
      console.log(`[Auto-Registration] Created new patient profile for +91 ${last10}`);
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB (expires in 5 minutes)
    await OtpModel.deleteMany({ phone: last10 });
    await OtpModel.create({
      phone: last10,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    // Output to server logs for developer testing
    console.log(`\n==========================================\n[WhatsApp OTP] Code: ${code} for +91 ${last10}\n==========================================\n`);

    return NextResponse.json({
      success: true,
      message: isNewPatient
        ? "New account created. OTP sent via WhatsApp."
        : "OTP sent successfully via WhatsApp.",
      code,          // for developer testing
      isNewPatient,  // Flutter uses this to route to profile completion
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send OTP." },
      { status: 500 }
    );
  }
}
