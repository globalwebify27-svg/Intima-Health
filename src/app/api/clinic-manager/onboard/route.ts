import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { PatientModel } from "@/modules/patients/schema";
import { UserModel } from "@/modules/auth/schema";
import { AppointmentService } from "@/modules/appointments/service";
import { sendWelcomeMessage } from "@/lib/whatsapp";

export const dynamic = 'force-dynamic';


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
    const { name, email, phone, gender, dob, allergies, medicalHistory, doctorId, date, time, type, paymentMethod, paymentStatus } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ success: false, message: "Name, email, and phone number are required." }, { status: 400 });
    }

    // 1. Onboard Patient in PatientModel
    let isNewPatient = false;
    let patient = await PatientModel.findOne({ email }).exec();
    if (!patient) {
      isNewPatient = true;
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

    // Send welcome message if it is a new patient
    if (isNewPatient) {
      await sendWelcomeMessage(patient._id.toString());
    }

    // 3. Create Appointment if scheduling details are provided
    let appointment = null;
    if (doctorId && date && time) {
      appointment = await AppointmentService.bookAppointment({
        patientId: patient._id.toString(),
        doctorId,
        date,
        time,
        type: type || "Walk-in",
        serviceName: type === "Video" ? "Online Consultation" : "Walk-in Consultation",
        notes: "Scheduled by clinic manager as walk-in.",
        paymentMethod: paymentMethod || "Cash",
        paymentStatus: paymentStatus || "Paid"
      }, payload.email);

      // Create Payment record immediately so it appears in Admin & Clinic Manager payment ledgers
      if (appointment) {
        try {
          const { PaymentModel } = await import("@/modules/pharmacy/schema");
          const aptDoc = appointment as any;
          const aptId = aptDoc._id.toString();
          const txnId = aptDoc.transactionId || `WALKIN-${aptId.slice(-8).toUpperCase()}`;
          const isPaid = (paymentStatus || "Paid") === "Paid";
          const fee = Number(aptDoc.feeAmount || 0);

          await PaymentModel.create({
            appointmentId: aptDoc._id,
            patientId: patient._id,
            customerName: patient.name,
            customerPhone: patient.phone,
            customerEmail: patient.email,
            context: `Walk-in Appointment (${aptDoc.type || "Consultation"}${aptDoc.serviceName ? ` • ${aptDoc.serviceName}` : ""})`,
            paymentMethod: paymentMethod || "Cash",
            gatewayProvider: (paymentMethod === "Cash" || isPaid) ? "Cash / Counter" : "HDFC SmartGateway",
            gatewayOrderId: txnId,
            gatewayTransactionId: txnId,
            amount: fee,
            currency: "INR",
            status: isPaid ? "Success" : "Pending",
            createdBy: payload.email,
          });
        } catch (pErr: any) {
          console.error("[Onboard] Payment creation notice:", pErr.message);
        }
      }
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
