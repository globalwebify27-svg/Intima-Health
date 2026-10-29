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
    const fields = url.searchParams.get("fields");
    const query: any = { deletedAt: null };
    if (type) query.type = type;
    
    await connectDB();
    let q = TreatmentModel.find(query).sort({ createdAt: -1 });
    if (fields) {
      q = q.select(fields.split(",").join(" "));
    }
    const items = await q.lean();
    return NextResponse.json(
      { success: true, data: items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
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
