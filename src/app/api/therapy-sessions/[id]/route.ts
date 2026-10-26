import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapySessionModel } from "@/modules/pharmacy/schema";
import "@/modules/therapists/schema";
import "@/modules/doctors/schema";
import "@/modules/patients/schema";
import "@/modules/clinics/schema";
import "@/modules/consultations/schema";
import { logAuditEvent } from "@/lib/audit";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const payload = token ? verifyJwt(token) : null;

    const session = await TherapySessionModel.findById(id)
      .populate("patientId")
      .populate("therapistId")
      .populate("doctorId")
      .populate("clinicId")
      .populate("consultationId")
      .exec();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Therapy session not found." },
        { status: 404 }
      );
    }

    // Log clinical record access
    if (payload?.userId) {
      await logAuditEvent({
        userId: payload.userId,
        action: "CLINICAL_RECORD_ACCESSED",
        details: {
          sessionId: id,
          patientId: (session.patientId as any)?._id?.toString(),
          therapistId: (session.therapistId as any)?._id?.toString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve session." },
      { status: 500 }
    );
  }
}
