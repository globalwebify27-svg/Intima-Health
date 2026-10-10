import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { AppointmentRepository } from "@/modules/appointments/repository";

export const dynamic = 'force-dynamic';


interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const apt = await AppointmentRepository.findById(id);

    if (!apt) {
      return NextResponse.json({ success: false, message: "Appointment not found." }, { status: 404 });
    }

    if (apt.type !== "Video") {
      return NextResponse.json({ success: false, message: "Only applicable for Video consultations." }, { status: 400 });
    }

    const { sendVideoConsultationReminder } = await import("@/lib/whatsapp");
    const patient = apt.patientId as any;
    const doctor = apt.doctorId as any;
    const clinic = apt.clinicId as any;

    if (patient?.phone) {
      await sendVideoConsultationReminder({
        patientId: patient._id?.toString() || id,
        phone: patient.phone,
        patientName: patient.name || "Patient",
        doctorName: doctor?.name || "Doctor",
        date: apt.date,
        time: apt.time,
        clinicName: clinic?.name || "Kelkar Manas Health Clinic"
      });
      return NextResponse.json({ success: true, message: "Video reminder sent via WhatsApp successfully." });
    } else {
      return NextResponse.json({ success: false, message: "Patient phone number not found." }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to send video reminder." }, { status: 400 });
  }
}
