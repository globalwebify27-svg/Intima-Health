import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapySessionModel } from "@/modules/pharmacy/schema";
import { logAuditEvent } from "@/lib/audit";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const payload = token ? verifyJwt(token) : null;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { therapistNotes, status = "Completed" } = body;

    const session = await TherapySessionModel.findById(id).exec();
    if (!session) {
      return NextResponse.json({ success: false, message: "Therapy session not found." }, { status: 404 });
    }

    // Update notes and status
    if (therapistNotes !== undefined) session.therapistNotes = therapistNotes;
    if (status) session.status = status;
    await session.save();

    // Synchronize status with mirrored appointment records
    if (status === "Completed") {
      try {
        const { AppointmentModel } = await import("@/modules/appointments/schema");
        const { ObjectId } = await import("mongodb");
        
        const patientIdRaw = (session.patientId && typeof session.patientId === "object" && (session.patientId as any)._id)
          ? (session.patientId as any)._id
          : session.patientId;
        
        const patientIdVariants: any[] = [patientIdRaw];
        if (patientIdRaw) {
          const strId = patientIdRaw.toString();
          if (ObjectId.isValid(strId)) {
            patientIdVariants.push(new ObjectId(strId));
          }
        }

        const query: any = {
          patientId: { $in: patientIdVariants },
          status: { $nin: ["Cancelled", "Completed"] },
        };

        const orConditions: any[] = [];
        if (session.name) {
          orConditions.push({ serviceName: session.name });
          orConditions.push({ serviceName: new RegExp(`^${session.name.trim()}$`, "i") });
          orConditions.push({ notes: new RegExp(session.name.trim(), "i") });
        }
        if (session._id) {
          orConditions.push({ notes: new RegExp(session._id.toString(), "i") });
        }
        if (session.videoChannelName) {
          orConditions.push({ videoChannelName: session.videoChannelName });
        }
        if (session.date) {
          orConditions.push({ date: session.date });
          const parts = session.date.trim().split(/[-/]/);
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              orConditions.push({ date: `${parts[2]}-${parts[1]}-${parts[0]}` });
            } else if (parts[2].length === 4) {
              orConditions.push({ date: `${parts[2]}-${parts[1]}-${parts[0]}` });
            }
          }
        }
        if (orConditions.length > 0) {
          query.$or = orConditions;
        }

        await AppointmentModel.updateMany(query, {
          $set: {
            status: "Completed",
            updatedBy: payload?.userId || "Therapist",
          },
        });
      } catch (syncErr) {
        console.warn("[Therapy Notes] Error syncing appointment status:", syncErr);
      }
    }

    await logAuditEvent({
      userId: payload?.userId || session.therapistId?.toString(),
      action: status === "Completed" ? "THERAPY_SESSION_COMPLETED" : "CLINICAL_RECORD_UPDATED",
      details: { sessionId: id, status },
    });

    return NextResponse.json({
      success: true,
      message: "Clinical documentation saved successfully.",
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update clinical notes." },
      { status: 500 }
    );
  }
}
