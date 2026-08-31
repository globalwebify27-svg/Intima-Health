import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { UserModel, hashPassword } from "@/modules/auth/schema";
import { PatientModel } from "@/modules/patients/schema";
import { signJwt } from "@/lib/jwt";
import { sendWelcomeMessage } from "@/lib/whatsapp";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit phone number starting with 6-9"),
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { name, email, phone } = parsed.data;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email }).exec();
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists." },
        { status: 400 }
      );
    }

    // Check if patient already exists by phone
    const last10 = phone.replace(/\D/g, "").slice(-10);
    const existingPatient = await PatientModel.findOne({ phone: new RegExp(last10 + '$') }).exec();
    if (existingPatient) {
      return NextResponse.json(
        { success: false, message: "A patient with this phone number already exists." },
        { status: 400 }
      );
    }

    // 1. Create Patient Model
    const patient = await PatientModel.create({
      name,
      email,
      phone,
      gender: "Male", // default
      status: "Active"
    });

    // 2. Create User Credentials
    const user = await UserModel.create({
      name,
      email,
      passwordHash: hashPassword(Math.random().toString(36).substring(7)),
      role: "PATIENT",
      status: "Active",
      patientId: patient._id
    });

    // 3. Send welcome WhatsApp message
    await sendWelcomeMessage(patient._id.toString());

    // 4. Generate JWT & sign in automatically
    const token = signJwt({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId: patient._id,
    });

    const response = NextResponse.json({
      success: true,
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: patient._id,
      },
    });

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400, // 1 day
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed." },
      { status: 500 }
    );
  }
}
