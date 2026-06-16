import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { ConsultationService } from "@/modules/consultations/service";
import { DoctorRepository } from "@/modules/doctors/repository";
import { PatientModel } from "@/modules/patients/schema";

export async function GET(req: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    let doctorId = searchParams.get("doctorId") || undefined;
    let patientId = searchParams.get("patientId") || undefined;
    let clinicId = searchParams.get("clinicId") || undefined;

    // Secure list filters based on roles
    if (payload.role === "DOCTOR") {
      const doctorProfile = await DoctorRepository.findByEmail(payload.email);
      if (!doctorProfile || !doctorProfile._id) {
        return NextResponse.json({ success: false, message: "Doctor profile not found." }, { status: 404 });
      }
      doctorId = doctorProfile._id.toString();
    } else if (payload.role === "PATIENT") {
      const patientProfile = await PatientModel.findOne({ email: payload.email }).exec();
      if (!patientProfile) {
        return NextResponse.json({ success: false, message: "Patient profile not found." }, { status: 404 });
      }
      patientId = patientProfile._id.toString();
    } else if (payload.role === "CLINIC_MANAGER") {
      if (!payload.clinicId) {
        return NextResponse.json({ success: false, message: "Clinic Manager clinic not configured." }, { status: 403 });
      }
      clinicId = payload.clinicId;
    }

    const consultations = await ConsultationService.listConsultations({
      doctorId,
      patientId,
      status,
      clinicId,
    });

    return NextResponse.json({
      success: true,
      data: consultations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve consultations." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });
    }

    const body = await req.json();
    const consultation = await ConsultationService.createConsultation(body, payload.email);

    return NextResponse.json({
      success: true,
      message: "Consultation initiated successfully.",
      data: consultation,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create consultation." },
      { status: 400 }
    );
  }
}
