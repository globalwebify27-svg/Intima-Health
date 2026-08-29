import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PlatformServicesService } from "@/modules/services/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const services = await PlatformServicesService.listServices();
    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch services." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const newService = await PlatformServicesService.createService(body);
    return NextResponse.json(
      { success: true, message: "Service created successfully.", data: newService },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create service." },
      { status: 400 }
    );
  }
}
