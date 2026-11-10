import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { NewsletterSubscriberModel } from "@/modules/newsletter/schema";
import { getAuthToken, verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

function isAdminRole(role?: string) {
  return role === "SUPER_ADMIN" || role === "CLINIC_ADMIN";
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getAuthToken(req);
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload || !isAdminRole(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const newStatus = body.status === "Unsubscribed" ? "Unsubscribed" : "Active";

    const subscriber = await NewsletterSubscriberModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status: newStatus,
          ...(newStatus === "Unsubscribed" ? { unsubscribedAt: new Date() } : { unsubscribedAt: null }),
        },
      },
      { new: true }
    ).exec();

    if (!subscriber) {
      return NextResponse.json({ success: false, message: "Subscriber not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: subscriber,
      message: `Subscriber marked as ${newStatus}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update subscriber" },
      { status: 500 }
    );
  }
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

    const deleted = await NewsletterSubscriberModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Subscriber removed successfully." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to remove subscriber" },
      { status: 500 }
    );
  }
}
