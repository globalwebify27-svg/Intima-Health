import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { UserModel, hashPassword } from "@/modules/auth/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT to update staff details and assignments
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { name, email, password, clinicId, status, doctorDetails } = body;

    const user = await UserModel.findById(id).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "Staff user not found." }, { status: 404 });
    }

    const oldEmail = user.email;

    // Check if email changed and is already taken
    if (email && email !== oldEmail) {
      const emailTaken = await UserModel.findOne({ email }).exec();
      if (emailTaken) {
        return NextResponse.json({ success: false, message: "New email is already in use." }, { status: 400 });
      }
    }

    // Update basic user details
    if (name) user.name = name;
    if (email) user.email = email;
    user.clinicId = clinicId ? clinicId : undefined;
    if (status) user.status = status;

    if (password) {
      user.passwordHash = hashPassword(password);
    }

    await user.save();

    // If role is DOCTOR, update Doctor collection
    if (user.role === "DOCTOR") {
      const doctor = await DoctorModel.findOne({ email: oldEmail }).exec();
      if (doctor) {
        if (name) doctor.name = name;
        if (email) doctor.email = email;
        doctor.clinicId = clinicId ? clinicId : undefined;
        if (status) doctor.status = status;

        if (doctorDetails) {
          if (doctorDetails.phone) doctor.phone = doctorDetails.phone;
          if (doctorDetails.specialization) doctor.specialization = doctorDetails.specialization;
          if (doctorDetails.experience !== undefined) doctor.experience = Number(doctorDetails.experience);
          if (doctorDetails.bio) doctor.bio = doctorDetails.bio;
          if (doctorDetails.fees !== undefined) doctor.fees = Number(doctorDetails.fees);
          if (doctorDetails.qualifications) doctor.qualifications = doctorDetails.qualifications;
          if (doctorDetails.availability) doctor.availability = doctorDetails.availability;
        }
        await doctor.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Staff member updated successfully."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update staff member." },
      { status: 500 }
    );
  }
}

// DELETE to remove staff member
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const user = await UserModel.findById(id).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "Staff user not found." }, { status: 404 });
    }

    const email = user.email;

    // Delete Doctor profile if user is a doctor
    if (user.role === "DOCTOR") {
      await DoctorModel.deleteOne({ email }).exec();
    }

    // Delete User credentials
    await UserModel.deleteOne({ _id: id }).exec();

    return NextResponse.json({
      success: true,
      message: "Staff member removed successfully."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete staff member." },
      { status: 500 }
    );
  }
}
