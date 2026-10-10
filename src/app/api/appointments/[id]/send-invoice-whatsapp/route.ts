import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { sendAppointmentBookingMessage } from "@/lib/whatsapp";

export const dynamic = 'force-dynamic';


export async function POST(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await sendAppointmentBookingMessage(id, true);

    return NextResponse.json({ success: true, message: "Invoice sent via WhatsApp successfully." });
  } catch (error: any) {
    console.error("Send WhatsApp invoice error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
