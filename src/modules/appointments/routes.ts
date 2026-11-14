import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { AppointmentService } from "./service";
import { getAuthToken, verifyJwt } from "@/lib/jwt";
import { UserModel } from "@/modules/auth/schema";
import { DoctorModel } from "@/modules/doctors/schema";

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

    const token = await getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Authentication is required to access patient appointment records." },
        { status: 401 }
      );
    }

    const payload = verifyJwt(token);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Invalid or expired authentication session." },
        { status: 401 }
      );
    }

    const user = await UserModel.findById(payload.userId).lean().exec();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. User account not found." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let doctorId = searchParams.get("doctorId") || undefined;
    let patientId = searchParams.get("patientId") || undefined;
    const date = searchParams.get("date") || undefined;
    const status = searchParams.get("status") || undefined;
    let clinicId = searchParams.get("clinicId") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;

    // Strict role-based scoping (HIPAA / DPDP BOLA prevention):
    if (user.role === "PATIENT") {
      // Patients may ONLY ever retrieve their own appointments
      const patientIdFromUser = user.patientId ? String(user.patientId) : undefined;
      if (!patientIdFromUser) {
        return NextResponse.json(
          { success: false, message: "Patient profile is not linked to this account." },
          { status: 403 }
        );
      }
      // Force patientId to the logged in patient; ignore any client-supplied spoofed parameter
      patientId = patientIdFromUser;
    } else if (user.role === "DOCTOR") {
      // Doctors may only view their assigned appointments
      const doctorDoc = await DoctorModel.findOne({ email: user.email }).lean().exec();
      if (!doctorDoc) {
        return NextResponse.json(
          { success: false, message: "Doctor profile not found." },
          { status: 403 }
        );
      }
      doctorId = String(doctorDoc._id);
    } else if (user.role === "CLINIC_MANAGER") {
      // Clinic managers are strictly scoped to their assigned clinic
      if (user.clinicId) {
        clinicId = String(user.clinicId);
      }
    }

    // When fetching for a doctor's schedule, only show paid/confirmed appointments
    const effectivePaymentStatus = doctorId && !paymentStatus ? "Paid" : paymentStatus;

    const list = await AppointmentService.getAppointments({
      doctorId,
      patientId,
      date,
      status,
      clinicId,
      paymentStatus: effectivePaymentStatus,
    });
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
