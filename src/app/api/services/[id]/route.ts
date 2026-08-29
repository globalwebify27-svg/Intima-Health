import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PlatformServicesService } from "@/modules/services/service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();
    const updatedService = await PlatformServicesService.updateService(id, body);
    
    return NextResponse.json(
      { success: true, message: "Service updated successfully.", data: updatedService },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update service." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    await PlatformServicesService.deleteService(id);
    
    return NextResponse.json(
      { success: true, message: "Service deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete service." },
      { status: 400 }
    );
  }
}
