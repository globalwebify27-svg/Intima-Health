import { handleReschedule, handleCancel } from "@/modules/appointments/routes";
import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { AppointmentRepository } from "@/modules/appointments/repository";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const apt = await AppointmentRepository.findById(id);
    if (!apt) {
      return NextResponse.json({ success: false, message: "Appointment not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: apt });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch appointment." }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return await handleReschedule(id, request);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return await handleCancel(id);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    if (!body.status) {
      return NextResponse.json({ success: false, message: "Status is required." }, { status: 400 });
    }
    const { AppointmentService } = await import("@/modules/appointments/service");
    const updated = await AppointmentService.updateStatus(id, body.status, "system");
    return NextResponse.json({ success: true, message: "Status updated successfully.", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to update status." }, { status: 400 });
  }
}
