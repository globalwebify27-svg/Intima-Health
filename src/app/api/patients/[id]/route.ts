import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt, signJwt } from "@/lib/jwt";
import { PatientModel } from "@/modules/patients/schema";
import { UserModel } from "@/modules/auth/schema";
import { sendPatientWelcomeEmail } from "@/lib/mail/service";

export const dynamic = 'force-dynamic';


interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const patient = await PatientModel.findById(id).exec();
    
    if (!patient) {
      return NextResponse.json({ success: false, message: "Patient profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: patient
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve profile." },
      { status: 500 }
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

    // Secure profile access: Patients can only edit their own profile
    if (payload.role === "PATIENT") {
      let authorized = false;
      if (payload.userId) {
        const user = await UserModel.findById(payload.userId).exec();
        if (user && user.patientId && user.patientId.toString() === id) {
          authorized = true;
        }
      }
      if (!authorized) {
        const patient = await PatientModel.findById(id).exec();
        if (patient && (patient.email === payload.email || patient.phone === payload.phone)) {
          authorized = true;
        }
      }
      if (!authorized) {
        return NextResponse.json(
          { success: false, message: "Forbidden. You can only update your own profile." },
          { status: 403 }
        );
      }
    }

    const currentPatient = await PatientModel.findById(id).exec();
    if (!currentPatient) {
      return NextResponse.json({ success: false, message: "Patient not found." }, { status: 404 });
    }

    const body = await req.json();

    // Map fields
    const updateData: any = {
      name: body.name,
      phone: body.phone,
      gender: body.gender,
      dob: body.dob ? new Date(body.dob) : undefined,
      allergies: body.allergies,
      medicalHistory: body.medicalHistory,
      emergencyContactName: body.emergencyContactName,
      emergencyContactPhone: body.emergencyContactPhone,
      updatedBy: payload.email,
    };

    let emailChanged = false;

    // Handle editable email address
    if (typeof body.email === "string" && body.email.trim()) {
      const cleanEmail = body.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return NextResponse.json(
          { success: false, message: "Please enter a valid email address format." },
          { status: 400 }
        );
      }

      if (cleanEmail !== currentPatient.email?.toLowerCase()) {
        // Prevent duplicate real emails across other patients
        const existingPatient = await PatientModel.findOne({
          email: cleanEmail,
          _id: { $ne: id },
        }).exec();

        if (existingPatient) {
          return NextResponse.json(
            { success: false, message: "This email address is already linked to another patient account." },
            { status: 400 }
          );
        }

        const existingUser = await UserModel.findOne({
          email: cleanEmail,
          patientId: { $ne: id },
        }).exec();

        if (existingUser) {
          return NextResponse.json(
            { success: false, message: "This email address is already registered to another user account." },
            { status: 400 }
          );
        }

        updateData.email = cleanEmail;
        emailChanged = true;

        // Sync linked UserModel email
        await UserModel.findOneAndUpdate(
          { patientId: id },
          { email: cleanEmail }
        ).exec();
      }
    }

    const updated = await PatientModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Patient not found." }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      message: emailChanged
        ? "Profile and email address updated successfully! Notifications are now active for your email."
        : "Profile updated successfully.",
      data: updated,
    });

    // Re-issue JWT cookie if email changed to keep session synchronized
    if (emailChanged && payload.userId) {
      const newToken = signJwt({
        userId: payload.userId,
        name: updated?.name || payload.name,
        email: updated?.email,
        role: payload.role,
        patientId: updated?._id,
      });

      response.cookies.set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    // Trigger welcome notification if updated to a valid email
    if (emailChanged && updated?._id) {
      sendPatientWelcomeEmail(updated._id.toString()).catch((err) => {
        console.error("[Profile Update] Error sending welcome notification:", err);
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile." },
      { status: 400 }
    );
  }
}
