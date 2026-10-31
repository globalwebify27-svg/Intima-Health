import { NextResponse } from "next/server";
import { verifyJwt, getAuthToken } from "@/lib/jwt";
import { connectDB } from "@/db/connect";
import { PatientModel } from "@/modules/patients/schema";
import { DoctorRepository } from "@/modules/doctors/repository";
import { UserModel } from "@/modules/auth/schema";

export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
  try {
    const token = await getAuthToken(req);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid session." },
        { status: 401 }
      );
    }

    await connectDB();
    const dbUser = await UserModel.findById(payload.userId).exec();
    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User session expired or user deleted." },
        { status: 401 }
      );
    }

    let profileId = undefined;
    let resolvedPhone: string | undefined = undefined;
    let resolvedClinicId = dbUser.clinicId;
    if (dbUser.role === "DOCTOR") {
      const doctorProfile = await DoctorRepository.findByEmail(dbUser.email);
      profileId = doctorProfile ? doctorProfile._id : undefined;
      if (doctorProfile && doctorProfile.clinicId) {
        resolvedClinicId = doctorProfile.clinicId;
      }
    } else if (dbUser.role === "THERAPIST") {
      const { TherapistModel } = await import("@/modules/therapists/schema");
      const therapistProfile = await TherapistModel.findOne({ email: dbUser.email }).exec();
      profileId = therapistProfile ? therapistProfile._id : undefined;
      if (therapistProfile && therapistProfile.clinicId) {
        resolvedClinicId = therapistProfile.clinicId;
      }
    } else if (dbUser.role === "PATIENT") {
      let patientProfile = null;
      if (dbUser.patientId) {
        profileId = dbUser.patientId;
        patientProfile = await PatientModel.findById(dbUser.patientId).exec();
      }
      if (!patientProfile) {
        // Fallback for older OTP users or email lookup
        if (dbUser.email && dbUser.email.includes("@noemail-intima.com")) {
          const phoneFromEmail = dbUser.email.split("@")[0];
          patientProfile = await PatientModel.findOne({ phone: new RegExp(phoneFromEmail + '$') }).exec();
        } else {
          patientProfile = await PatientModel.findOne({ email: dbUser.email }).exec();
        }
        profileId = patientProfile ? patientProfile._id : undefined;
      }

      if (patientProfile && patientProfile.phone) {
        resolvedPhone = patientProfile.phone;
      } else if (dbUser.email) {
        const potentialPhone = dbUser.email.split("@")[0].replace(/\D/g, "");
        if (potentialPhone.length === 10) {
          resolvedPhone = potentialPhone;
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        phone: resolvedPhone,
        role: dbUser.role,
        clinicId: resolvedClinicId,
        doctorId: dbUser.role === "DOCTOR" ? profileId : undefined,
        therapistId: dbUser.role === "THERAPIST" ? profileId : undefined,
        patientId: dbUser.role === "PATIENT" ? profileId : undefined,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve session.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
