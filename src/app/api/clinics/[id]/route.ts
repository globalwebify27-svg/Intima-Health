import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ClinicService } from "@/modules/clinics/service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const clinic = await ClinicService.getClinicById(id);
    if (!clinic) {
      return NextResponse.json({ success: false, message: "Clinic not found." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "Clinic retrieved successfully.",
      data: clinic,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve clinic." },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const updated = await ClinicService.updateClinic(id, body);
    return NextResponse.json({
      success: true,
      message: "Clinic updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update clinic." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    await ClinicService.deleteClinic(id);
    return NextResponse.json({
      success: true,
      message: "Clinic deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete clinic." },
      { status: 400 }
    );
  }
}
