import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PatientModel } from "@/modules/patients/schema";
import { UserModel, hashPassword } from "@/modules/auth/schema";
import { AppointmentService } from "@/modules/appointments/service";
import { signJwt } from "@/lib/jwt";
import { sendWelcomeMessage } from "@/lib/whatsapp";
import { DoctorModel } from "@/modules/doctors/schema";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { 
      service, city, clinic, date, time, 
      firstName, lastName, email, phone, dob 
    } = body;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ success: false, message: "Patient details are required." }, { status: 400 });
    }

    // 1. Find or create patient
    let patient = await PatientModel.findOne({ email }).exec();
    let isNewPatient = false;
    if (!patient) {
      isNewPatient = true;
      patient = await PatientModel.create({
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        gender: "Male",
        dob: dob ? new Date(dob) : undefined,
        status: "Active"
      });
    }

    // 2. Find or create user credentials
    let user = await UserModel.findOne({ email }).exec();
    if (!user) {
      user = await UserModel.create({
        name: `${firstName} ${lastName}`.trim(),
        email,
        passwordHash: hashPassword(`PATIENT_BOOKING_${Math.random().toString(36).substring(7)}`),
        role: "PATIENT",
        status: "Active",
        patientId: patient._id
      });
    }

    if (isNewPatient) {
      await sendWelcomeMessage(patient._id.toString());
    }

    // 3. Find doctor for the clinic/service
    let doctor = await DoctorModel.findOne({ clinicId: clinic, status: "Active" }).exec();
    if (!doctor) {
      doctor = await DoctorModel.findOne({ status: "Active" }).exec();
    }
    if (!doctor) {
      return NextResponse.json({ success: false, message: "No doctors available in the selected clinic." }, { status: 400 });
    }

    // Format time: convert "10:30 AM" or similar to standard 24h "10:30" format to match doctor slots
    let formattedTime = time;
    if (time.includes(" AM") || time.includes(" PM")) {
      const [timePart, modifier] = time.split(" ");
      let [hours, minutes] = timePart.split(":");
      if (hours === "12") {
        hours = "00";
      }
      if (modifier === "PM") {
        hours = String(parseInt(hours, 10) + 12);
      }
      formattedTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    }

    // 4. Book the appointment
    const appointment = await AppointmentService.bookAppointment({
      patientId: patient._id.toString(),
      doctorId: doctor._id.toString(),
      date,
      time: formattedTime,
      type: service === "consultation" ? "Video" : "In-person",
      notes: "Booked directly through public website booking form."
    }, email);

    // 5. Generate JWT & sign in automatically
    const token = signJwt({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId: patient._id,
    });

    const response = NextResponse.json({
      success: true,
      message: "Appointment booked successfully.",
      data: appointment
    });

    // Set cookie to log in
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400, // 1 day
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to book appointment." }, { status: 400 });
  }
}
