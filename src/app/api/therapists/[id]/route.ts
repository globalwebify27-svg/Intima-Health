import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapistModel } from "@/modules/therapists/schema";
import { UserModel, hashPassword } from "@/modules/auth/schema";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const therapist = await TherapistModel.findById(id).populate("clinicId").exec();
    if (!therapist) {
      return NextResponse.json({ success: false, message: "Therapist not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: therapist });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch therapist." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const therapist = await TherapistModel.findById(id).exec();
    if (!therapist) {
      return NextResponse.json({ success: false, message: "Therapist not found." }, { status: 404 });
    }

    const oldEmail = therapist.email;
    Object.assign(therapist, body);
    await therapist.save();

    // Also update associated UserModel
    const user = await UserModel.findOne({ email: oldEmail }).exec();
    if (user) {
      if (body.name) user.name = body.name;
      if (body.email) user.email = body.email;
      if (body.clinicId !== undefined) user.clinicId = body.clinicId || undefined;
      if (body.status) user.status = body.status;
      if (body.password) user.passwordHash = hashPassword(body.password);
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Therapist updated successfully.",
      data: therapist,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update therapist." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const therapist = await TherapistModel.findById(id).exec();
    if (!therapist) {
      return NextResponse.json({ success: false, message: "Therapist not found." }, { status: 404 });
    }

    therapist.deletedAt = new Date();
    therapist.status = "Inactive";
    await therapist.save();

    await UserModel.findOneAndUpdate(
      { email: therapist.email },
      { $set: { status: "Inactive", deletedAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: "Therapist deactivated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete therapist." },
      { status: 500 }
    );
  }
}
