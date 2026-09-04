import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { NewsletterSubscriberModel } from "@/modules/newsletter/schema";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

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
