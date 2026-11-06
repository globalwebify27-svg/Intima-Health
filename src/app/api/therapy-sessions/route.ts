import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapySessionModel } from "@/modules/pharmacy/schema";
import "@/modules/therapists/schema";
import "@/modules/doctors/schema";
import "@/modules/patients/schema";
import "@/modules/clinics/schema";
import "@/modules/consultations/schema";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const clinicId = searchParams.get("clinicId");
    const therapistId = searchParams.get("therapistId");
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");

    const query: Record<string, any> = {};
    if (patientId) {
      try {
        const { PatientModel } = await import("@/modules/patients/schema");
        const currentPatient = await PatientModel.findById(patientId).lean().exec();
        if (currentPatient) {
          const conditions: any[] = [{ _id: currentPatient._id }];
          if (currentPatient.phone) {
            const last10 = currentPatient.phone.replace(/\D/g, "").slice(-10);
            if (last10) conditions.push({ phone: new RegExp(last10 + "$") });
          }
          if (currentPatient.email && !currentPatient.email.includes("@noemail-intima.com")) {
            conditions.push({ email: currentPatient.email.toLowerCase() });
          }
          const matchingPatients = await PatientModel.find({ $or: conditions }).select("_id").lean().exec();
          query.patientId = { $in: matchingPatients.map((p: any) => p._id) };
        } else {
          query.patientId = patientId;
        }
      } catch {
        query.patientId = patientId;
      }
    }
    if (clinicId) query.clinicId = clinicId;
    if (therapistId) query.therapistId = therapistId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;

    const sessions = await TherapySessionModel.find(query)
      .populate("patientId")
      .populate("therapistId")
      .populate("doctorId")
      .populate("clinicId")
      .populate("consultationId")
      .sort({ createdAt: -1 })
      .exec();

    // Ensure populated therapist profiles have their avatar resolved
    for (const s of sessions) {
      if (s.therapistId && !(s.therapistId as any).avatar) {
        const thName = (s.therapistId as any).name?.toLowerCase() || "";
        if (thName.includes("deepak")) {
          (s.therapistId as any).avatar = "/images/doctor_1.png";
        } else if (thName.includes("amol")) {
          (s.therapistId as any).avatar = "/images/doctor_2.png";
        } else if (thName.includes("radhika")) {
          (s.therapistId as any).avatar = "/images/doctor_3.png";
        } else if ((s.doctorId as any)?.avatar) {
          (s.therapistId as any).avatar = (s.doctorId as any).avatar;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Therapy sessions retrieved successfully.",
      data: sessions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve therapy sessions." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // 1. Mark as Paid
    if (body.action === "pay" && body.sessionId) {
      const existing = await TherapySessionModel.findById(body.sessionId);
      if (!existing) {
        return NextResponse.json({ success: false, message: "Session not found." }, { status: 404 });
      }

      const channelName = existing.videoChannelName || `therapy_${existing._id}_${Date.now().toString(36)}`;
      const updated = await TherapySessionModel.findByIdAndUpdate(
        body.sessionId,
        {
          $set: {
            paymentStatus: "Paid",
            status: existing.date && existing.time ? "Scheduled" : "Paid",
            videoChannelName: channelName,
            transactionId: body.transactionId || `PAY-${Date.now()}`,
          },
        },
        { new: true }
      ).populate("therapistId patientId");

      await logAuditEvent({
        userId: existing.patientId?.toString(),
        action: "THERAPY_PAYMENT_COMPLETED",
        details: { sessionId: body.sessionId, amount: existing.price, transactionId: body.transactionId },
      });

      return NextResponse.json({
        success: true,
        message: "Therapy session paid successfully.",
        data: updated,
      });
    }

    // 2. Request Reassignment (Patient flags unavailability)
    if (body.action === "request_reassignment" && body.sessionId) {
      const existing = await TherapySessionModel.findById(body.sessionId);
      if (!existing) {
        return NextResponse.json({ success: false, message: "Session not found." }, { status: 404 });
      }

      const history = existing.assignmentHistory || [];
      history.push({
        assignedBy: existing.doctorId,
        therapistId: existing.therapistId,
        assignedAt: new Date(),
        reason: body.reason || "Patient requested reassignment due to schedule unavailability",
      });

      existing.status = "Reassignment_Requested";
      existing.assignmentHistory = history;
      await existing.save();

      await logAuditEvent({
        userId: existing.patientId?.toString(),
        action: "REASSIGNMENT_REQUESTED",
        details: { sessionId: body.sessionId, doctorId: existing.doctorId, reason: body.reason },
      });

      return NextResponse.json({
        success: true,
        message: "Reassignment request submitted. Your doctor has been notified.",
        data: existing,
      });
    }

    // 3. Reassign Therapist (Doctor reallocates)
    if (body.action === "reassign" && body.sessionId && body.newTherapistId) {
      const existing = await TherapySessionModel.findById(body.sessionId);
      if (!existing) {
        return NextResponse.json({ success: false, message: "Session not found." }, { status: 404 });
      }

      const history = existing.assignmentHistory || [];
      history.push({
        assignedBy: body.doctorId || existing.doctorId,
        therapistId: body.newTherapistId,
        assignedAt: new Date(),
        reason: body.reason || "Reassigned by prescribing doctor",
      });

      existing.therapistId = body.newTherapistId;
      existing.status = "Recommended";
      existing.date = undefined;
      existing.time = undefined;
      existing.assignmentHistory = history;
      if (body.doctorNotes) existing.doctorNotes = body.doctorNotes;
      if (body.recommendedMode) existing.recommendedMode = body.recommendedMode;
      await existing.save();

      await logAuditEvent({
        userId: (body.doctorId || existing.doctorId)?.toString(),
        action: "THERAPIST_REASSIGNED",
        details: {
          sessionId: body.sessionId,
          newTherapistId: body.newTherapistId,
          reason: body.reason,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Therapist successfully reassigned.",
        data: existing,
      });
    }

    // Default create
    const newSession = new TherapySessionModel(body);
    await newSession.save();
    return NextResponse.json({
      success: true,
      message: "Therapy session created successfully.",
      data: newSession,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process request." },
      { status: 400 }
    );
  }
}
