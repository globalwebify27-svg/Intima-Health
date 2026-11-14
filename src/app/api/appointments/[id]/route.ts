import { handleReschedule, handleCancel } from "@/modules/appointments/routes";
import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { AppointmentRepository } from "@/modules/appointments/repository";
import { getAuthToken, verifyJwt } from "@/lib/jwt";
import { UserModel } from "@/modules/auth/schema";

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await connectDB();

    const token = await getAuthToken(request);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    const payload = verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: "Unauthorized. Invalid session." }, { status: 401 });
    }

    const { id } = await params;
    const apt = await AppointmentRepository.findById(id);
    if (!apt) {
      return NextResponse.json({ success: false, message: "Appointment not found." }, { status: 404 });
    }

    // Role-based authorization: patients can only inspect their own appointment
    if (payload.role === "PATIENT") {
      const user = await UserModel.findById(payload.userId).select("patientId").lean().exec();
      const userPatientId = user?.patientId ? String(user.patientId) : undefined;
      const aptPatientId = (apt.patientId as any)?._id ? String((apt.patientId as any)._id) : String(apt.patientId);

      if (!userPatientId || userPatientId !== aptPatientId) {
        return NextResponse.json({ success: false, message: "Forbidden. Access denied." }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: apt });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch appointment." }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const token = await getAuthToken(request);
  if (!token || !verifyJwt(token)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const response = await handleReschedule(id, request);
  const data = await response.json();

  if (data.success && data.data) {
    try {
      const { sendAppointmentRescheduled } = await import("@/lib/whatsapp");
      const apt = data.data;
      const patient = apt.patientId as any;
      const doctor = apt.doctorId as any;
      if (patient?.phone) {
        await sendAppointmentRescheduled({
          patientId: patient._id?.toString() || id,
          phone: patient.phone,
          patientName: patient.name || "Patient",
          doctorName: doctor?.name || "Doctor",
          date: apt.date,
          time: apt.time,
          mode: apt.type,
          clinicName: "Kelkar Manas Health Clinic",
          managerPhone: "+91 91753 10398",
        });
      }
    } catch (err) {
      console.error("WhatsApp reschedule notification failed:", err);
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const token = await getAuthToken(request);
  if (!token || !verifyJwt(token)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const response = await handleCancel(id);
  const data = await response.json();

  if (data.success && data.data) {
    try {
      const { sendAppointmentCancelled } = await import("@/lib/whatsapp");
      const apt = data.data;
      const patient = apt.patientId as any;
      const doctor = apt.doctorId as any;
      
      if (patient?.phone) {
        await sendAppointmentCancelled({
          patientId: patient._id?.toString() || id,
          phone: patient.phone,
          patientName: patient.name || "Patient",
          doctorName: doctor?.name || "Doctor",
          date: apt.date,
          time: apt.time,
          mode: apt.type,
          clinicName: "Kelkar Manas Health Clinic"
        });
      }
    } catch (err) {
      console.error("WhatsApp cancellation notification failed:", err);
    }
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await connectDB();

    const token = await getAuthToken(request);
    if (!token || !verifyJwt(token)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

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
