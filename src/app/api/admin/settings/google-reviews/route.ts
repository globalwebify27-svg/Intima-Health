import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { SettingModel } from "@/modules/system/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token || !verifyJwt(token)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const [apiKeySetting, banerPlaceSetting, bhosariPlaceSetting] = await Promise.all([
      SettingModel.findOne({ key: "google_places_api_key" }).lean(),
      SettingModel.findOne({ key: "google_place_id_baner" }).lean(),
      SettingModel.findOne({ key: "google_place_id_bhosari" }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        apiKey: apiKeySetting?.value || process.env.GOOGLE_PLACES_API_KEY || "",
        banerPlaceId: banerPlaceSetting?.value || process.env.GOOGLE_PLACE_ID_BANER || "ChIJBUovIfG_wjsR2D0_8I_81VM",
        bhosariPlaceId: bhosariPlaceSetting?.value || process.env.GOOGLE_PLACE_ID_BHOSARI || "",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load Google Reviews settings.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const payload = token ? verifyJwt(token) : null;
    if (!payload || (payload.role !== "SUPER_ADMIN" && payload.role !== "ADMIN")) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey = "", banerPlaceId = "", bhosariPlaceId = "" } = body;

    await Promise.all([
      SettingModel.findOneAndUpdate(
        { key: "google_places_api_key" },
        { value: apiKey.trim(), description: "Google Places API key for real-time reviews" },
        { upsert: true, new: true }
      ),
      SettingModel.findOneAndUpdate(
        { key: "google_place_id_baner" },
        { value: banerPlaceId.trim(), description: "Google Place ID for Kelkar Manas Baner Clinic" },
        { upsert: true, new: true }
      ),
      SettingModel.findOneAndUpdate(
        { key: "google_place_id_bhosari" },
        { value: bhosariPlaceId.trim(), description: "Google Place ID for Kelkar Manas Bhosari Clinic" },
        { upsert: true, new: true }
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: "Google Places integration settings saved successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update Google Reviews settings.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

