import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ClinicServiceModel } from "@/modules/clinics/schema";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const updated = await ClinicServiceModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) {
      return NextResponse.json({ success: false, message: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Service updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update service." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await ClinicServiceModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Service not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete service." },
      { status: 400 }
    );
  }
}
