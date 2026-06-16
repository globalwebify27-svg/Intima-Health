import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { DoctorService } from "./service";

export async function handleGetDoctors(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get("specialization") || undefined;
    const status = searchParams.get("status") || undefined;
    const clinicId = searchParams.get("clinicId") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await DoctorService.getDoctorsList({ specialization, status, clinicId, page, limit });
    return NextResponse.json({
      success: true,
      message: "Doctors listed successfully.",
      data: result.doctors,
      meta: {
        total: result.total,
        page,
        limit,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to list doctors." },
      { status: 400 }
    );
  }
}

export async function handleCreateDoctor(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    // Default system user if auth is not yet plugged in
    const newDoctor = await DoctorService.registerDoctor(body, "system");
    return NextResponse.json(
      { success: true, message: "Doctor registered successfully.", data: newDoctor },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to register doctor." },
      { status: 400 }
    );
  }
}

export async function handleGetDoctorById(id: string) {
  try {
    await connectDB();
    const doctor = await DoctorService.getDoctorById(id);
    return NextResponse.json({
      success: true,
      message: "Doctor profile retrieved.",
      data: doctor,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Doctor not found." },
      { status: 404 }
    );
  }
}

import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { DoctorRepository } from "./repository";

export async function handleUpdateDoctor(id: string, req: Request) {
  try {
    await connectDB();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }
    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });
    }

    // If logged-in user is a doctor, verify they are modifying their own profile
    if (payload.role === "DOCTOR") {
      const selfDoctor = await DoctorRepository.findByEmail(payload.email);
      if (!selfDoctor || !selfDoctor._id || selfDoctor._id.toString() !== id) {
        return NextResponse.json(
          { success: false, message: "Forbidden. You can only update your own profile." },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const updated = await DoctorService.updateProfile(id, body, payload.email);
    return NextResponse.json({
      success: true,
      message: "Doctor profile updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile." },
      { status: 400 }
    );
  }
}

export async function handleDeleteDoctor(id: string) {
  try {
    await connectDB();
    await DoctorService.removeDoctor(id, "system");
    return NextResponse.json({
      success: true,
      message: "Doctor profile deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete doctor." },
      { status: 400 }
    );
  }
}
