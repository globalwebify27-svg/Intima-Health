import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PatientModel } from "@/modules/patients/schema";
import { UserModel, hashPassword } from "@/modules/auth/schema";
import { AppointmentService } from "@/modules/appointments/service";
import { signJwt } from "@/lib/jwt";
import { sendWelcomeMessage } from "@/lib/whatsapp";
import { DoctorModel } from "@/modules/doctors/schema";
import { ClinicServiceModel } from "@/modules/clinics/schema";
import { PlatformServiceModel } from "@/modules/services/schema";
import { z } from "zod";

const bookingSchema = z.object({
  service: z.string().min(1, "Service is required"),
  city: z.string().optional(),
  clinic: z.string().optional(),
  doctorId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit phone number starting with 6-9"),
  dob: z.string().optional(),
  paymentMethod: z.string().optional(),
  isExistingPatient: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const rawBody = await req.json();
    
    const parsed = bookingSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const body = parsed.data;
    let { 
      service, city, clinic, doctorId, date, time, 
      firstName, lastName, email: providedEmail, phone, dob,
      paymentMethod, isExistingPatient
    } = body;

    let email = providedEmail;

    let patient;
    let user;
    let isNewPatient = false;

    if (isExistingPatient) {
      // Look up existing patient by phone
      patient = await PatientModel.findOne({ phone }).exec();
      if (!patient) {
        return NextResponse.json({ success: false, message: "Patient profile not found for this phone number." }, { status: 404 });
      }
      if (patient.email) {
        user = await UserModel.findOne({ $or: [{ patientId: patient._id }, { email: patient.email }] }).exec();
      } else {
        user = await UserModel.findOne({ patientId: patient._id }).exec();
      }

      if (!user) {
        // Fallback user creation just in case
        user = await UserModel.create({
          name: patient.name,
          email: patient.email || `${phone}@noemail-intima.com`,
          passwordHash: hashPassword(`PATIENT_BOOKING_${Math.random().toString(36).substring(7)}`),
          role: "PATIENT",
          status: "Active",
          patientId: patient._id
        });
      } else if (!user.patientId) {
        user.patientId = patient._id;
        await user.save();
      }
    } else {
      if (!firstName || !lastName) {
        return NextResponse.json({ success: false, message: "Patient details (Name and Phone) are required." }, { status: 400 });
      }

      if (!email || email.trim() === "") {
        email = `${phone}@noemail-intima.com`;
      }

      // Find or create patient
      patient = await PatientModel.findOne({ email }).exec();
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

      // Find or create user credentials
      user = await UserModel.findOne({ email }).exec();
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
    }

    // 3. Find doctor for the clinic/service
    let doctor = null;
    if (doctorId) {
      doctor = await DoctorModel.findById(doctorId).exec();
    }
    if (!doctor) {
      doctor = await DoctorModel.findOne({ clinicId: clinic, status: "Active" }).exec();
    }
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

    // Get service name
    let serviceNameStr = "Consultation";
    let isVideo = false;
    if (service === "consultation") {
      serviceNameStr = "Initial Consultation";
      isVideo = true;
    } else {
      const svc = await PlatformServiceModel.findById(service).exec();
      if (svc) {
        serviceNameStr = svc.name;
        if (svc.name.toLowerCase().includes('online') || svc.name.toLowerCase().includes('video')) {
          isVideo = true;
        }
      }
    }

    // 4. Book the appointment
    const appointment = await AppointmentService.bookAppointment({
      patientId: patient._id.toString(),
      doctorId: doctor._id.toString(),
      date,
      time: formattedTime,
      type: isVideo ? "Video" : "In-person",
      serviceName: serviceNameStr,
      notes: "Booked directly through public website booking form.",
      skipNotification: true,
      paymentMethod: paymentMethod || "Online",
      paymentStatus: "Pending"
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
