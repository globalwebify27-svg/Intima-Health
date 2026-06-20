import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { PatientModel } from "@/modules/patients/schema";
import { UserModel } from "@/modules/auth/schema";

// GET — fetch full patient profile
export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "PATIENT") {
      return NextResponse.json({ success: false, message: "Not authorized." }, { status: 403 });
    }

    const user = await UserModel.findById(payload.userId).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    const patient = await PatientModel.findOne({ email: user.email }).exec();

    return NextResponse.json({
      success: true,
      profile: {
        id: patient?._id,
        name: patient?.name ?? user.name,
        email: patient?.email ?? user.email,
        phone: patient?.phone,
        gender: patient?.gender,
        dob: patient?.dob,
        allergies: patient?.allergies ?? [],
        medicalHistory: patient?.medicalHistory,
        isProfileComplete: !!(patient?.name && !patient.name.startsWith("Patient ") && patient?.email && !patient.email.endsWith("@intima.app")),
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch profile." }, { status: 500 });
  }
}

// PUT — update patient profile
export async function PUT(req: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "PATIENT") {
      return NextResponse.json({ success: false, message: "Not authorized." }, { status: 403 });
    }

    const user = await UserModel.findById(payload.userId).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, gender, dob, allergies, medicalHistory } = body;

    const patient = await PatientModel.findOne({ email: user.email }).exec();
    if (!patient) {
      return NextResponse.json({ success: false, message: "Patient profile not found." }, { status: 404 });
    }

    // Check email uniqueness if changing
    if (email && email !== patient.email) {
      const existing = await PatientModel.findOne({ email }).exec();
      if (existing) {
        return NextResponse.json({ success: false, message: "This email is already in use." }, { status: 400 });
      }
    }

    // Update patient record
    if (name) { patient.name = name; user.name = name; }
    if (email) { patient.email = email; user.email = email; }
    if (gender) patient.gender = gender;
    if (dob) patient.dob = new Date(dob);
    if (allergies) patient.allergies = allergies;
    if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;

    await patient.save();
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      profile: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        dob: patient.dob,
        allergies: patient.allergies,
        medicalHistory: patient.medicalHistory,
        isProfileComplete: true,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to update profile." }, { status: 500 });
  }
}
