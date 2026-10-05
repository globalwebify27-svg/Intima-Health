import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { AppointmentModel } from "@/modules/appointments/schema";
import { PatientModel } from "@/modules/patients/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import { generateInvoicePdf } from "@/lib/pdfGenerator";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const appointment = await AppointmentModel.findById(id)
      .populate({ path: "patientId", model: PatientModel })
      .populate({ path: "doctorId", model: DoctorModel })
      .populate({ path: "clinicId", model: ClinicModel })
      .exec();

    if (!appointment) {
      return NextResponse.json({ success: false, message: "Appointment not found." }, { status: 404 });
    }

    const patientName = appointment.patientId?.name || "Patient";
    const doctorName = appointment.doctorId?.name || "Doctor";
    const clinicName = appointment.clinicId?.name || "Kelkar Manas Health Clinic";

    const invoiceBuffer = await generateInvoicePdf({
      patientName,
      doctorName,
      clinicName,
      date: appointment.date,
      time: appointment.time,
      amount: appointment.feeAmount?.toString() || "0",
      paymentId: appointment.transactionId || `TXN-${appointment._id.toString().substring(0, 10).toUpperCase()}`,
      paymentMethod: appointment.paymentMethod || "Online",
      status: appointment.paymentStatus || "Pending",
    });

    return new NextResponse(invoiceBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Invoice-${appointment._id}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("Generate invoice error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
