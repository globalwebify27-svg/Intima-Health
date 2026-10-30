import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { SettingModel } from "@/modules/system/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// GET current site branding & logo
export async function GET() {
  try {
    await connectDB();
    const logoSetting = await SettingModel.findOne({ key: "site_logo" }).lean();
    return NextResponse.json({
      success: true,
      data: {
        logoUrl: logoSetting?.value || "/logo.png",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load branding.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT update site logo (Admin only)
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !["SUPER_ADMIN", "ADMIN", "CLINIC_ADMIN", "CLINIC_MANAGER"].includes(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { logoUrl } = body;

    if (!logoUrl || typeof logoUrl !== "string" || !logoUrl.trim()) {
      return NextResponse.json({ success: false, message: "A valid logo image URL or path is required." }, { status: 400 });
    }

    await connectDB();
    await SettingModel.findOneAndUpdate(
      { key: "site_logo" },
      { value: logoUrl.trim(), category: "branding" },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Clinic logo updated successfully.",
      data: { logoUrl: logoUrl.trim() },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update branding logo.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

