import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { PatientModel } from "@/modules/patients/schema";

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
      const patient = await PatientModel.findOne({ email: payload.email }).exec();
      if (!patient || patient._id.toString() !== id) {
        return NextResponse.json(
          { success: false, message: "Forbidden. You can only update your own profile." },
          { status: 403 }
        );
      }
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
      updatedBy: payload.email
    };

    const updated = await PatientModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Patient not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile." },
      { status: 400 }
    );
  }
}
