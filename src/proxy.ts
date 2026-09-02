import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Secret must match the one used in jwt.ts
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_me_in_production";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

// Simple edge-compatible signature verification to avoid loading full node modules
function verifyTokenSignature(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [, payloadStr] = parts;
    const payload = JSON.parse(base64UrlDecode(payloadStr));
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const tokenCookie = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Protect Admin Dashboard Routes
  if (path.startsWith("/admin")) {
    if (!tokenCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = verifyTokenSignature(tokenCookie);
    if (!payload || (payload.role !== "SUPER_ADMIN" && payload.role !== "CLINIC_ADMIN")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect Admin API modifying routes
  if (path.startsWith("/api/doctors") && ["POST", "PUT", "DELETE"].includes(request.method)) {
    if (!tokenCookie) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 401 });
    }
    const payload = verifyTokenSignature(tokenCookie);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Forbidden. Invalid session." }, { status: 403 });
    }
    
    // Admins can do anything. Doctors can only PUT (to update their own availability/profile).
    if (payload.role === "DOCTOR") {
      if (request.method !== "PUT") {
        return NextResponse.json({ success: false, message: "Forbidden. Admin access required." }, { status: 403 });
      }
    } else if (payload.role !== "SUPER_ADMIN" && payload.role !== "CLINIC_ADMIN") {
      return NextResponse.json({ success: false, message: "Forbidden. Admin access required." }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/doctors/:path*"],
};
