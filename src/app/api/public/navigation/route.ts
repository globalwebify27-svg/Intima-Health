import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TreatmentModel } from "@/modules/cms/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const items = await TreatmentModel.find({ deletedAt: null })
      .select("title slug heroSubtext badge type")
      .sort({ createdAt: -1 })
      .lean();

    const treatments = items.filter((item) => item.type !== "sexual-problem");
    const sexualProblems = items.filter((item) => item.type === "sexual-problem");

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
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load navigation items." },
      { status: 500 }
    );
  }
}
