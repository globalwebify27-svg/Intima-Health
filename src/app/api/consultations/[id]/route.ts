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
