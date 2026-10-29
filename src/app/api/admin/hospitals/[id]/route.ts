import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { HospitalService } from "@/modules/hospitals/service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJwt(token);
  if (!payload || payload.role !== "SUPER_ADMIN") return null;
  return payload;
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await HospitalService.update(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Hospital not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Hospital updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update hospital." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const deleted = await HospitalService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Hospital not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Hospital deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete hospital." },
      { status: 500 }
    );
  }
}
