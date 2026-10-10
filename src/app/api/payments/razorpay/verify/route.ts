import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PaymentModel } from "@/modules/pharmacy/schema";
import { AppointmentModel } from "@/modules/appointments/schema";
import crypto from "crypto";

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
  try {
    await connectDB();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency = "INR",
      patientId,
      appointmentId,
      orderId
    } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is authentic
      
      // Save payment record
      const payment = await PaymentModel.create({
        patientId,
        appointmentId,
        orderId,
        gatewayProvider: "Razorpay",
        gatewayTransactionId: razorpay_payment_id,
        amount: amount,
        currency: currency,
        status: "Success",
      });

      // If appointment payment, update appointment
      if (appointmentId) {
         await AppointmentModel.findByIdAndUpdate(appointmentId, {
            paymentStatus: "Paid",
            transactionId: razorpay_payment_id,
         });
      }

      return NextResponse.json({ success: true, message: "Payment verified successfully", payment });
    } else {
      // Create a failed payment record
      await PaymentModel.create({
        patientId,
        appointmentId,
        orderId,
        gatewayProvider: "Razorpay",
        gatewayTransactionId: razorpay_payment_id || "failed",
        amount: amount,
        currency: currency,
        status: "Failed",
      });
      return NextResponse.json({ error: "Invalid signature sent!" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
