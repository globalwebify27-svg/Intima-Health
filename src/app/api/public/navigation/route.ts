import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TreatmentModel } from "@/modules/cms/schema";
import { SettingModel } from "@/modules/system/schema";

export const revalidate = 60; // Cache for 1 minute

export async function GET() {
  try {
    await connectDB();
    const [items, logoSetting] = await Promise.all([
      TreatmentModel.find({ deletedAt: null })
        .select("title slug heroSubtext badge type")
        .lean(),
      SettingModel.findOne({ key: "site_logo" }).lean(),
    ]);

    const treatments = items.filter((item: any) => item.type !== "sexual-problem");
    const sexualProblems = items.filter((item: any) => item.type === "sexual-problem");
    const logoUrl = logoSetting?.value || "/logo.png";

    return NextResponse.json(
      {
        success: true,
        data: {
          treatments,
          sexualProblems,
          logoUrl,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to load navigation items from DB:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          treatments: [],
          sexualProblems: [],
          logoUrl: "/logo.png",
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  }
}
