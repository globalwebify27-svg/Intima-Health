import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { AppointmentService } from "./service";

export async function handleGetSlots(doctorId: string, req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ success: false, message: "Date parameter is required (YYYY-MM-DD)." }, { status: 400 });
    }

    const slots = await AppointmentService.calculateAvailableSlots(doctorId, date);
    return NextResponse.json({
      success: true,
      message: "Time slots calculated successfully.",
      data: slots,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to query slots." }, { status: 400 });
  }
}

export async function handleBookAppointment(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const apt = await AppointmentService.bookAppointment(body, "system");
    return NextResponse.json({
      success: true,
      message: "Appointment scheduled successfully.",
      data: apt,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to book appointment." }, { status: 400 });
  }
}

export async function handleGetAppointments(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId") || undefined;
    const patientId = searchParams.get("patientId") || undefined;
    const date = searchParams.get("date") || undefined;
    const status = searchParams.get("status") || undefined;
    const clinicId = searchParams.get("clinicId") || undefined;

    const list = await AppointmentService.getAppointments({ doctorId, patientId, date, status, clinicId });
    return NextResponse.json({
      success: true,
      message: "Appointments retrieved successfully.",
      data: list,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch appointments." }, { status: 400 });
  }
}

export async function handleReschedule(id: string, req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const updated = await AppointmentService.reschedule(id, body, "system");
    return NextResponse.json({
      success: true,
      message: "Appointment rescheduled successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to reschedule." }, { status: 400 });
  }
}

export async function handleCancel(id: string) {
  try {
    await connectDB();
    const updated = await AppointmentService.cancel(id, "system");
    return NextResponse.json({
      success: true,
      message: "Appointment cancelled successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to cancel appointment." }, { status: 400 });
  }
}
