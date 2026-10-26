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
