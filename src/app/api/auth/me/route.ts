import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt, getAuthToken } from "@/lib/jwt";
import { connectDB } from "@/db/connect";
import { PatientModel } from "@/modules/patients/schema";
import { DoctorRepository } from "@/modules/doctors/repository";
import { UserModel } from "@/modules/auth/schema";

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
    let resolvedClinicId = dbUser.clinicId;
    if (dbUser.role === "DOCTOR") {
      const doctorProfile = await DoctorRepository.findByEmail(dbUser.email);
      profileId = doctorProfile ? doctorProfile._id : undefined;
      if (doctorProfile && doctorProfile.clinicId) {
        resolvedClinicId = doctorProfile.clinicId;
      }
    } else if (dbUser.role === "PATIENT") {
      if (dbUser.patientId) {
        profileId = dbUser.patientId;
      } else {
        // Fallback for older OTP users
        if (dbUser.email && dbUser.email.includes("@noemail-intima.com")) {
          const phone = dbUser.email.split("@")[0];
          const patientProfile = await PatientModel.findOne({ phone: new RegExp(phone + '$') }).exec();
          profileId = patientProfile ? patientProfile._id : undefined;
        } else {
          const patientProfile = await PatientModel.findOne({ email: dbUser.email }).exec();
          profileId = patientProfile ? patientProfile._id : undefined;
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        clinicId: resolvedClinicId,
        doctorId: dbUser.role === "DOCTOR" ? profileId : undefined,
        patientId: dbUser.role === "PATIENT" ? profileId : undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve session." },
      { status: 500 }
    );
  }
}
