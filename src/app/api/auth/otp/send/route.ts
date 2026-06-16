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

    // Find patient profile
    const patient = await PatientModel.findOne({ 
      phone: new RegExp(last10 + '$') 
    }).exec();

    if (!patient) {
      return NextResponse.json({ 
        success: false, 
        message: "No patient profile found with this WhatsApp number. Please contact clinic support." 
      }, { status: 404 });
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
      message: "OTP sent successfully via WhatsApp."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send OTP." },
      { status: 500 }
    );
  }
}
