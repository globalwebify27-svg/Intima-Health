import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TreatmentModel } from "@/modules/cms/schema";

export const revalidate = 300; // Cache for 5 minutes (ISR for API)

export async function GET() {
  try {
    await connectDB();
    const items = await TreatmentModel.find({ deletedAt: null })
      .select("title slug heroSubtext badge type")
      .lean();

    const treatments = items.filter((item: any) => item.type !== "sexual-problem");
    const sexualProblems = items.filter((item: any) => item.type === "sexual-problem");

    return NextResponse.json(
      {
        success: true,
        data: {
          treatments,
          sexualProblems,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
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
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  }
}
