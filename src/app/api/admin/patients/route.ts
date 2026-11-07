import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { PatientModel } from "@/modules/patients/schema";
import { AppointmentModel } from "@/modules/appointments/schema";
import { TherapySessionModel } from "@/modules/pharmacy/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { TherapistModel } from "@/modules/therapists/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !["SUPER_ADMIN", "ADMIN", "CLINIC_MANAGER"].includes(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectDB();

    // 1. Fetch reference collections for metadata resolution
    const [clinics, doctors, therapists] = await Promise.all([
      ClinicModel.find({ status: "Active" }).select("_id name city").lean(),
      DoctorModel.find({ deletedAt: null }).select("_id name specialization clinicId").lean(),
      TherapistModel.find({ deletedAt: null }).select("_id name specialization clinicId").lean(),
    ]);

    const clinicMap = new Map<string, any>(clinics.map((c: any) => [c._id.toString(), c]));
    const doctorMap = new Map<string, any>(doctors.map((d: any) => [d._id.toString(), d]));
    const therapistMap = new Map<string, any>(therapists.map((t: any) => [t._id.toString(), t]));

    // 2. Fetch all patients
    const patients = await PatientModel.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Fetch appointments and therapy sessions to enrich patients
    const [appointments, therapySessions] = await Promise.all([
      AppointmentModel.find({ deletedAt: null }).sort({ date: -1, createdAt: -1 }).lean(),
      TherapySessionModel.find({ deletedAt: null }).sort({ date: -1, createdAt: -1 }).lean(),
    ]);

    // Group appointments by patientId
    const patientAppointmentsMap = new Map<string, any[]>();
    for (const app of appointments) {
      const pId = app.patientId?.toString();
      if (!pId) continue;
      if (!patientAppointmentsMap.has(pId)) {
        patientAppointmentsMap.set(pId, []);
      }
      patientAppointmentsMap.get(pId)!.push(app);
    }

    // Group therapy sessions by patientId
    const patientTherapyMap = new Map<string, any[]>();
    for (const ts of therapySessions) {
      const pId = ts.patientId?.toString();
      if (!pId) continue;
      if (!patientTherapyMap.has(pId)) {
        patientTherapyMap.set(pId, []);
      }
      patientTherapyMap.get(pId)!.push(ts);
    }

    // Collect distinct treatments across the entire platform
    const treatmentsSet = new Set<string>();

    // 4. Enrich each patient
    const enrichedPatients = patients.map((patient: any) => {
      const pId = patient._id.toString();
      const patientApps = patientAppointmentsMap.get(pId) || [];
      const patientTherapies = patientTherapyMap.get(pId) || [];

      // Determine registered / visited clinic(s)
      const clinicIds = new Set<string>();
      patientApps.forEach((a) => {
        if (a.clinicId) clinicIds.add(a.clinicId.toString());
      });
      patientTherapies.forEach((t) => {
        if (t.clinicId) clinicIds.add(t.clinicId.toString());
      });

      const patientClinics = Array.from(clinicIds)
        .map((cid) => clinicMap.get(cid))
        .filter(Boolean);

      const primaryClinic = patientClinics[0] || null;

      // Determine assigned doctors
      const doctorIds = new Set<string>();
      patientApps.forEach((a) => {
        if (a.doctorId) doctorIds.add(a.doctorId.toString());
      });
      patientTherapies.forEach((t) => {
        if (t.doctorId) doctorIds.add(t.doctorId.toString());
      });
      const assignedDoctors = Array.from(doctorIds)
        .map((did) => doctorMap.get(did))
        .filter(Boolean);

      // Determine assigned therapists
      const therapistIds = new Set<string>();
      patientTherapies.forEach((t) => {
        if (t.therapistId) therapistIds.add(t.therapistId.toString());
      });
      const assignedTherapists = Array.from(therapistIds)
        .map((tid) => therapistMap.get(tid))
        .filter(Boolean);

      // Determine treatments & services
      const patientTreatments = new Set<string>();
      patientApps.forEach((a) => {
        if (a.serviceName) {
          patientTreatments.add(a.serviceName);
          treatmentsSet.add(a.serviceName);
        }
      });
      patientTherapies.forEach((t) => {
        if (t.name) {
          patientTreatments.add(t.name);
          treatmentsSet.add(t.name);
        }
      });

      // Determine appointment modes
      const modesSet = new Set<string>();
      patientApps.forEach((a) => {
        if (a.type) modesSet.add(a.type);
      });
      patientTherapies.forEach((t) => {
        if (t.selectedMode) modesSet.add(t.selectedMode);
        else if (t.recommendedMode && t.recommendedMode !== "Both") modesSet.add(t.recommendedMode);
      });

      let appointmentModeSummary = "None";
      const hasOnline = modesSet.has("Video") || modesSet.has("Online");
      const hasWalkin = modesSet.has("Walk-in") || modesSet.has("Offline");
      if (hasOnline && hasWalkin) {
        appointmentModeSummary = "Both";
      } else if (hasOnline) {
        appointmentModeSummary = "Online";
      } else if (hasWalkin) {
        appointmentModeSummary = "Walk-in";
      }

      // Latest visit / appointment date
      const latestApp = patientApps[0];
      const lastAppointmentDate = latestApp?.date || null;

      return {
        _id: pId,
        name: patient.name || "Unknown Patient",
        email: patient.email || "",
        phone: patient.phone || "",
        dob: patient.dob || null,
        gender: patient.gender || "",
        allergies: patient.allergies || [],
        medicalHistory: patient.medicalHistory || "",
        emergencyContactName: patient.emergencyContactName || "",
        emergencyContactPhone: patient.emergencyContactPhone || "",
        status: patient.status || "Active",
        createdAt: patient.createdAt,
        registeredClinic: primaryClinic
          ? { _id: primaryClinic._id.toString(), name: primaryClinic.name, city: primaryClinic.city }
          : null,
        allClinics: patientClinics.map((c) => ({
          _id: c._id.toString(),
          name: c.name,
          city: c.city,
        })),
        assignedDoctor: assignedDoctors[0] || null,
        assignedDoctors: assignedDoctors.map((d) => ({
          _id: d._id.toString(),
          name: d.name,
          specialization: d.specialization || "Doctor",
        })),
        assignedTherapist: assignedTherapists[0] || null,
        assignedTherapists: assignedTherapists.map((t) => ({
          _id: t._id.toString(),
          name: t.name,
          specialization: t.specialization || "Therapist",
        })),
        treatments: Array.from(patientTreatments),
        primaryTreatment: Array.from(patientTreatments)[0] || "General Consultation",
        appointmentMode: appointmentModeSummary,
        totalAppointments: patientApps.length + patientTherapies.length,
        lastAppointmentDate,
      };
    });

    // 5. Aggregate KPI Metrics
    const totalPatients = enrichedPatients.length;
    const activePatients = enrichedPatients.filter((p) => p.status === "Active").length;
    const onlinePatients = enrichedPatients.filter(
      (p) => p.appointmentMode === "Online" || p.appointmentMode === "Both"
    ).length;
    const walkinPatients = enrichedPatients.filter(
      (p) => p.appointmentMode === "Walk-in" || p.appointmentMode === "Both"
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        patients: enrichedPatients,
        meta: {
          totalPatients,
          activePatients,
          onlinePatients,
          walkinPatients,
        },
        filterOptions: {
          clinics: clinics.map((c: any) => ({ _id: c._id.toString(), name: c.name, city: c.city })),
          doctors: doctors.map((d: any) => ({
            _id: d._id.toString(),
            name: d.name,
            specialization: d.specialization,
          })),
          therapists: therapists.map((t: any) => ({
            _id: t._id.toString(),
            name: t.name,
            specialization: t.specialization,
          })),
          treatments: Array.from(treatmentsSet).sort(),
        },
      },
    });
  } catch (error: any) {
    console.error("Admin patients error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch patients directory." },
      { status: 500 }
    );
  }
}

