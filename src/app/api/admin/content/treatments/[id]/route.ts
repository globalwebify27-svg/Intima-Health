import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TreatmentModel } from "@/modules/cms/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { unlink } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;
  const payload = verifyJwt(token);
  return payload && payload.role === "SUPER_ADMIN";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await connectDB();
    const item = await TreatmentModel.findById(resolvedParams.id).lean();
    if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    const resolvedParams = await params;
    const body = await req.json();
    await connectDB();
    
    const oldItem = await TreatmentModel.findById(resolvedParams.id);
    if (!oldItem) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    // If image was cleared or changed, remove old uploaded file from disk if it was in /uploads/
    if (oldItem.heroImage && oldItem.heroImage !== body.heroImage && oldItem.heroImage.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", oldItem.heroImage);
        await unlink(filePath);
      } catch {
        // file might already be removed, safely ignore
      }
    }

    const updated = await TreatmentModel.findByIdAndUpdate(resolvedParams.id, body, { new: true });
    
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    const resolvedParams = await params;
    await connectDB();
    const deleted = await TreatmentModel.findByIdAndUpdate(resolvedParams.id, { deletedAt: new Date() }, { new: true });
    if (!deleted) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, data: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
