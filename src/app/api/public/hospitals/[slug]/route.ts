import { NextResponse } from "next/server";
import { HospitalService } from "@/modules/hospitals/service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const hospital = await HospitalService.getBySlug(slug);
    if (!hospital) {
      return NextResponse.json(
        { success: false, message: "Hospital not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: hospital,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load hospital." },
      { status: 500 }
    );
  }
}
