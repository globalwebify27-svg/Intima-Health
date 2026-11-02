import { NextResponse } from "next/server";
import { sendDailyAdminReport } from "@/lib/mail/service";
import { getAuthToken, verifyJwt } from "@/lib/jwt";

export const dynamic = "force-dynamic";

async function isAuthorized(req: Request): Promise<boolean> {
  // 1. Check Cron Secret in authorization header or query param
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get("key");
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "kmh_daily_report_secret_key_2026";

  if (secretParam === cronSecret || authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // 2. Check if caller is an authenticated ADMIN user
  try {
    const token = await getAuthToken(req);
    if (token) {
      const payload = verifyJwt(token);
      if (payload && (payload.role === "SUPER_ADMIN" || payload.role === "CLINIC_ADMIN")) {
        return true;
      }
    }
  } catch {}

  return false;
}

export async function GET(req: Request) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const result = await sendDailyAdminReport();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(req: Request) {
  const authorized = await isAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const result = await sendDailyAdminReport();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

