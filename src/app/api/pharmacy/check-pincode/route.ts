import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PharmacyConfigModel } from "@/modules/pharmacy/settings-schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pinCode = searchParams.get("pincode")?.trim();

    if (!pinCode || pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
      return NextResponse.json({
        success: false,
        message: "Please enter a valid 6-digit Indian PIN code.",
        isServiceable: false,
      }, { status: 400 });
    }

    await connectDB();
    let config = await PharmacyConfigModel.findOne().exec();
    if (!config) {
      config = await PharmacyConfigModel.create({});
    }

    const matchedPin = config.serviceablePincodes.find(
      (p: { pinCode: string; areaName?: string; deliveryCharge?: number; estimatedHours?: string; isActive?: boolean }) =>
        p.pinCode === pinCode && p.isActive !== false
    );

    if (matchedPin) {
      return NextResponse.json({
        success: true,
        isServiceable: true,
        data: {
          pinCode: matchedPin.pinCode,
          areaName: matchedPin.areaName,
          deliveryCharge: matchedPin.deliveryCharge ?? config.defaultDeliveryFee ?? 50,
          estimatedHours: matchedPin.estimatedHours || "24-48 Hours",
          freeDeliveryThreshold: config.freeDeliveryThreshold || 500,
          city: "Akola",
          state: "Maharashtra",
          pharmacyPartner: config.pharmacyName,
          licenseNumber: config.licenseNumber,
        },
      });
    }

    return NextResponse.json({
      success: true,
      isServiceable: false,
      message: `Delivery is currently not available for PIN code ${pinCode}. Kelkar Manas Health Care medicine delivery is currently serving Akola, Maharashtra (PIN codes: 444001, 444002, 444003, 444004, 444005, 444006).`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to verify PIN code serviceability.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
