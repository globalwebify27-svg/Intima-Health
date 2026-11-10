import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { NewsletterCampaignModel } from "@/modules/newsletter/schema";
import { getAuthToken, verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

function isAdminRole(role?: string) {
  return role === "SUPER_ADMIN" || role === "CLINIC_ADMIN";
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload || !isAdminRole(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const deleted = await NewsletterCampaignModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Campaign not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Campaign deleted from history." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete campaign" },
      { status: 500 }
    );
  }
}

