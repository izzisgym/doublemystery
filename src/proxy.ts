import { NextRequest, NextResponse } from "next/server";
import { getAdminEnv } from "@/lib/env";
import { applyRateLimit } from "@/lib/rate-limit";

const PROTECTED_PREFIXES = ["/admin", "/api/admin"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function unauthorizedResponse() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Double Mystery Admin"',
    },
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();

  const adminEnv = getAdminEnv();
  const adminUser = adminEnv?.ADMIN_USERNAME;
  const adminPass = adminEnv?.ADMIN_PASSWORD;

  const rateLimitResponse = applyRateLimit(request, {
    keyPrefix: "admin-auth",
    windowMs: 60_000,
    maxRequests: 120,
  });
  if (rateLimitResponse) return rateLimitResponse;

  // Fail closed if admin credentials are not configured.
  if (!adminUser || !adminPass) {
    return new NextResponse("Admin credentials not configured", { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const encoded = authHeader.split(" ")[1];
  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorizedResponse();
  }
  const separator = decoded.indexOf(":");
  if (separator < 0) return unauthorizedResponse();

  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  if (username !== adminUser || password !== adminPass) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
