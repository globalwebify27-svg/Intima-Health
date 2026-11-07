import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { PatientModel } from "@/modules/patients/schema";
import { AppointmentModel } from "@/modules/appointments/schema";
import { TherapySessionModel } from "@/modules/pharmacy/schema";
import { ConsultationModel } from "@/modules/consultations/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { TherapistModel } from "@/modules/therapists/schema";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !["SUPER_ADMIN", "ADMIN", "CLINIC_MANAGER", "DOCTOR"].includes(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });
    }

    await connectDB();

    const patient = await PatientModel.findById(id).lean();
    if (!patient) {
      return NextResponse.json({ success: false, message: "Patient not found." }, { status: 404 });
    }

    // Fetch full appointment history populated with Doctor and Clinic
    const appointments = await AppointmentModel.find({ patientId: id as any, deletedAt: null })
      .populate({ path: "doctorId", model: DoctorModel, select: "name specialization phone email avatar" })
      .populate({ path: "clinicId", model: ClinicModel, select: "name city address phone" })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Fetch therapy sessions populated with Therapist and Clinic
    const therapySessions = await TherapySessionModel.find({ patientId: id as any, deletedAt: null })
      .populate({ path: "therapistId", model: TherapistModel, select: "name specialization phone email avatar" })
      .populate({ path: "doctorId", model: DoctorModel, select: "name specialization" })
      .populate({ path: "clinicId", model: ClinicModel, select: "name city address" })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Fetch consultations and clinical notes
    const consultations = await ConsultationModel.find({ patientId: id as any, deletedAt: null })
      .populate({ path: "doctorId", model: DoctorModel, select: "name specialization" })
      .populate({ path: "clinicId", model: ClinicModel, select: "name city" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        patient,
        appointments,
        therapySessions,
        consultations,
      },
    });
  } catch (error: any) {
    console.error("Fetch patient details error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch patient details." },
      { status: 500 }
    );
  }
}

// Allow updating patient status (Active / Inactive) or contact details
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !["SUPER_ADMIN", "ADMIN"].includes(payload.role)) {
      return NextResponse.json({ success: false, message: "Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    const allowedUpdates: any = {};
    if (body.status && ["Active", "Inactive"].includes(body.status)) {
      allowedUpdates.status = body.status;
    }
    if (body.phone) allowedUpdates.phone = body.phone.trim();
    if (body.email) allowedUpdates.email = body.email.trim();
    if (body.emergencyContactName) allowedUpdates.emergencyContactName = body.emergencyContactName.trim();
    if (body.emergencyContactPhone) allowedUpdates.emergencyContactPhone = body.emergencyContactPhone.trim();
    if (body.medicalHistory !== undefined) allowedUpdates.medicalHistory = body.medicalHistory;

    const updated = await PatientModel.findByIdAndUpdate(id, allowedUpdates, { new: true }).lean();

    return NextResponse.json({
      success: true,
      message: "Patient profile updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update patient." },
      { status: 500 }
    );
  }
}
