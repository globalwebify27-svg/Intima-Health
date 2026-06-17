import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ClinicServiceModel } from "@/modules/clinics/schema";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const doctorId = searchParams.get("doctorId");

    const query: Record<string, any> = {};
    if (clinicId) query.clinicId = clinicId;
    if (doctorId) query.doctorId = doctorId;

    const list = await ClinicServiceModel.find(query)
      .populate("clinicId")
      .populate("doctorId")
      .sort({ name: 1 })
      .exec();

    return NextResponse.json({
      success: true,
      message: "Clinic services retrieved successfully.",
      data: list,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to retrieve services." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const { clinicId, doctorId, name, price, description, status } = body;

    if (!clinicId || !name || price === undefined) {
      return NextResponse.json(
        { success: false, message: "Clinic, Service name, and Price are required." },
        { status: 400 }
      );
    }

    const newService = new ClinicServiceModel({
      clinicId,
      doctorId: doctorId || undefined,
      name,
      price: Number(price),
      description,
      status: status || "Active",
    });

    await newService.save();

    return NextResponse.json({
      success: true,
      message: "Service created successfully.",
      data: newService,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create service." },
      { status: 400 }
    );
  }
}
