import { NextRequest, NextResponse } from "next/server";

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

  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;

  // Fail closed if admin credentials are not configured.
  if (!adminUser || !adminPass) {
    return new NextResponse("Admin credentials not configured", { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const encoded = authHeader.split(" ")[1];
  const decoded = atob(encoded);
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
