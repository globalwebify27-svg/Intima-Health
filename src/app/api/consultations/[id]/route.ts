import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { ConsultationService } from "@/modules/consultations/service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const consultation = await ConsultationService.getConsultation(id);
    return NextResponse.json({
      success: true,
      data: consultation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Consultation not found." },
      { status: 404 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    
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
    const updated = await ConsultationService.updateConsultation(id, body, payload.email);

    // Safeguard: if status was "Completed" in request, force it directly via native MongoDB
    // to avoid Mongoose model caching issues on Vercel serverless
    if (body.status === "Completed") {
      const { connectDB: _connectDB } = await import("@/db/connect");
      const mongoose = (await import("mongoose")).default;
      const rawCol = mongoose.connection.collection("consultations");
      const { ObjectId } = await import("mongodb");
      await rawCol.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "Completed", updatedAt: new Date() } }
      );
      // Also update the appointment
      if (updated && updated.appointmentId) {
        const aptId = (updated.appointmentId as any)?._id || updated.appointmentId;
        await mongoose.connection.collection("appointments").updateOne(
          { _id: new ObjectId(aptId.toString()) },
          { $set: { status: "Completed", updatedAt: new Date() } }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Consultation updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update consultation." },
      { status: 400 }
    );
  }
}
