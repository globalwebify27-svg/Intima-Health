import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PharmacyConfigModel } from "@/modules/pharmacy/settings-schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// GET current pharmacy & delivery configuration (Public/Authenticated)
export async function GET() {
  try {
    await connectDB();
    let config = await PharmacyConfigModel.findOne().exec();
    if (!config) {
      config = await PharmacyConfigModel.create({});
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load pharmacy configuration.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

// PUT update pharmacy & delivery configuration (Admin / Pharmacy Staff)
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !["SUPER_ADMIN", "CLINIC_ADMIN", "PHARMACY_STAFF", "CLINIC_MANAGER"].includes(payload.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin or Pharmacy access required." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    let config = await PharmacyConfigModel.findOne().exec();
    if (!config) {
      config = await PharmacyConfigModel.create({
        ...body,
        updatedBy: payload.name || payload.email,
      });
    } else {
      Object.assign(config, body);
      config.updatedBy = payload.name || payload.email;
      await config.save();
    }

    return NextResponse.json({
      success: true,
      message: "Pharmacy configuration and delivery settings updated successfully.",
      data: config,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update configuration.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
