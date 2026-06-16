import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { PatientModel } from "@/modules/patients/schema";
import { UserModel } from "@/modules/auth/schema";
import { AppointmentService } from "@/modules/appointments/service";

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
      return NextResponse.json({ success: false, message: "Unauthorized. Clinic Manager access required." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, gender, dob, allergies, medicalHistory, doctorId, date, time, type } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ success: false, message: "Name, email, and phone number are required." }, { status: 400 });
    }

    // 1. Onboard Patient in PatientModel
    let patient = await PatientModel.findOne({ email }).exec();
    if (!patient) {
      patient = await PatientModel.create({
        name,
        email,
        phone,
        gender: gender || "Male",
        dob: dob ? new Date(dob) : undefined,
        allergies: allergies ? allergies.split(",").map((a: string) => a.trim()).filter(Boolean) : [],
        medicalHistory: medicalHistory || "",
        status: "Active"
      });
    }

    // 2. Create User Credentials for OTP logins
    let user = await UserModel.findOne({ email }).exec();
    if (!user) {
      user = await UserModel.create({
        name,
        email,
        passwordHash: `CLINIC_MANAGER_WALKIN_${Math.random().toString(36).substring(7)}`,
        role: "PATIENT",
        status: "Active",
        patientId: patient._id
      });
    }

    // 3. Create Appointment if scheduling details are provided
    let appointment = null;
    if (doctorId && date && time) {
      appointment = await AppointmentService.bookAppointment({
        patientId: patient._id.toString(),
        doctorId,
        date,
        time,
        type: type || "In-person",
        notes: "Scheduled by clinic manager as walk-in."
      }, payload.email);
    }

    return NextResponse.json({
      success: true,
      message: "Patient onboarded successfully.",
      data: {
        patient,
        user,
        appointment
      }
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to onboard patient." }, { status: 400 });
  }
}
