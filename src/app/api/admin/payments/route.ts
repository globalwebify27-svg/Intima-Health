import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PaymentModel } from "@/modules/pharmacy/schema";

export async function GET(req: Request) {
  try {
    await connectDB();
    
    // Fetch payments, populating patient info
    const payments = await PaymentModel.find()
      .populate("patientId", "name phone email")
      .populate({
        path: "appointmentId",
        select: "date time type doctorId clinicId",
        populate: [
          { path: "doctorId", select: "name" },
          { path: "clinicId", select: "name" }
        ]
      })
      .populate("orderId", "totalAmount")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    console.error("Fetch payments error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
