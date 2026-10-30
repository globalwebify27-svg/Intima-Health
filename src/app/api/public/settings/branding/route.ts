import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { SettingModel } from "@/modules/system/schema";

export const revalidate = 60; // Cache for 1 minute

export async function GET() {
  try {
    await connectDB();
    const logoSetting = await SettingModel.findOne({ key: "site_logo" }).lean();
    return NextResponse.json(
      {
        success: true,
        data: {
          logoUrl: logoSetting?.value || "/logo.png",
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load branding.";
    return NextResponse.json(
      {
        success: true,
        data: { logoUrl: "/logo.png" },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  }
}

