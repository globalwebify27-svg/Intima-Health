import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TreatmentModel } from "@/modules/cms/schema";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return false;
  const payload = verifyJwt(token);
  return payload && payload.role === "SUPER_ADMIN";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const query = type ? { type } : {};
    
    await connectDB();
    const items = await TreatmentModel.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }
    const body = await req.json();
    await connectDB();
    const newItem = new TreatmentModel(body);
    await newItem.save();
    return NextResponse.json({ success: true, data: newItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
