import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { HospitalService } from "@/modules/hospitals/service";

export const dynamic = "force-dynamic";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyJwt(token);
  if (!payload || payload.role !== "SUPER_ADMIN") return null;
  return payload;
}

export async function GET() {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const hospitals = await HospitalService.listAll(true);
    return NextResponse.json({
      success: true,
      data: hospitals,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load hospitals." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { success: false, message: "Hospital name and slug are required." },
        { status: 400 }
      );
    }

    const created = await HospitalService.create(body);
    return NextResponse.json({
      success: true,
      message: "Hospital created successfully.",
      data: created,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create hospital." },
      { status: 500 }
    );
  }
}
