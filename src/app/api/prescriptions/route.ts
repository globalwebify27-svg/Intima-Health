import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt, getAuthToken } from "@/lib/jwt";
import { PatientModel } from "@/modules/patients/schema";
import { DoctorRepository } from "@/modules/doctors/repository";
import { ConsultationModel } from "@/modules/consultations/schema";

import { AppointmentModel } from "@/modules/appointments/schema";

// GET /api/prescriptions?search=<name or phone>
// Returns matching patients scoped to the doctor's clinic only
export async function GET(req: Request) {
  try {
    await connectDB();
    const token = await getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "DOCTOR") {
      return NextResponse.json({ success: false, message: "Doctors only." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    if (!search || search.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Get doctor profile to find their clinic
    const doctor = await DoctorRepository.findByEmail(payload.email);
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor profile not found." }, { status: 404 });
    }

    const clinicId = (doctor as any).clinicId;
    if (!clinicId) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Find all unique patient IDs who have appointments at this clinic
    const clinicAppointments = await AppointmentModel.find({ clinicId })
      .select("patientId")
      .lean()
      .exec();

    const clinicPatientIds = [
      ...new Set(clinicAppointments.map((a: any) => a.patientId?.toString()).filter(Boolean))
    ];

    if (clinicPatientIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Search by name or phone, restricted to this clinic's patients only
    const patients = await PatientModel.find({
      _id: { $in: clinicPatientIds },
      $or: [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
      deletedAt: null,
    })
      .select("_id name phone email gender")
      .limit(15)
      .exec();

    return NextResponse.json({ success: true, data: patients });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/prescriptions
// Creates a standalone walk-in prescription (no appointment needed)
// Stores as a Completed ConsultationModel record so it flows into all views
export async function POST(req: Request) {
  try {
    await connectDB();
    const token = await getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "DOCTOR") {
      return NextResponse.json({ success: false, message: "Doctors only." }, { status: 403 });
    }

    const body = await req.json();
    const { patientId, drugs, therapies, notes } = body;

    const hasDrugs = Array.isArray(drugs) && drugs.length > 0;
    const hasTherapies = Array.isArray(therapies) && therapies.length > 0;

    if (!patientId || (!hasDrugs && !hasTherapies)) {
      return NextResponse.json(
        { success: false, message: "Patient and at least one medication or therapy are required." },
        { status: 400 }
      );
    }

    // Get doctor profile (need doctorId + clinicId)
    const doctor = await DoctorRepository.findByEmail(payload.email);
    if (!doctor) {
      return NextResponse.json({ success: false, message: "Doctor profile not found." }, { status: 404 });
    }

    const prescriptionSummary = JSON.stringify(
      drugs.map((d: any) => ({
        drug: d.drug,
        dosage: d.dosage,
        frequency: d.frequency,
        duration: d.duration,
      }))
    );

    const prescribedTherapiesJson = Array.isArray(therapies) && therapies.length > 0
      ? JSON.stringify(therapies.map((t: any) => ({ name: t.name, price: Number(t.price) })))
      : undefined;

    // Create a "walk-in" consultation record marked Completed
    // appointmentId is optional — omitting it signals a walk-in/direct prescription
    const consultation = new ConsultationModel({
      patientId,
      doctorId: (doctor as any)._id,
      videoChannelName: `walkin-rx-${Math.random().toString(36).substring(2, 9)}`,
      status: "Completed",
      notes: notes || "",
      prescriptionSummary,
      prescribedTherapies: prescribedTherapiesJson,
      prescriptionStatus: "Pending",
      createdBy: payload.email,
    });

    await consultation.save();

    // Create TherapySession billing records (same as consultation-room flow)
    if (prescribedTherapiesJson && (doctor as any).clinicId) {
      try {
        const { TherapySessionModel } = await import("@/modules/pharmacy/schema");
        const therapyList = JSON.parse(prescribedTherapiesJson);
        for (const therapy of therapyList) {
          if (therapy.name) {
            const session = new TherapySessionModel({
              patientId,
              clinicId: (doctor as any).clinicId,
              name: therapy.name,
              price: Number(therapy.price) || 0,
              status: "Recommended",
              consultationId: (consultation as any)._id,
            });
            await session.save();
          }
        }
      } catch (err) {
        console.error("Failed to create therapy session records:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Prescription issued and signed successfully.",
      data: consultation,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
