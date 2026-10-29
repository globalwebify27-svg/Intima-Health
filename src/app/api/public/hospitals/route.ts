import { NextResponse } from "next/server";
import { HospitalService } from "@/modules/hospitals/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hospitals = await HospitalService.listAll(false);
    return NextResponse.json(
      {
        success: true,
        data: hospitals,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load hospitals." },
      { status: 500 }
    );
  }
}
