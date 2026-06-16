import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ClinicService } from "@/modules/clinics/service";

export async function GET() {
  try {
    await connectDB();
    const clinics = await ClinicService.listClinics();
    return NextResponse.json({
      success: true,
      message: "Clinics listed successfully.",
      data: clinics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to list clinics." },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newClinic = await ClinicService.createClinic(body);
    return NextResponse.json(
      { success: true, message: "Clinic created successfully.", data: newClinic },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create clinic." },
      { status: 400 }
    );
  }
}
