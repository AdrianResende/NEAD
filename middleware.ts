import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants";
import { getSessionFromRequest } from "@/lib/auth";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = getSessionFromRequest(request);

  if (!token) {
    if (pathname === ROUTES.LOGIN) return NextResponse.next();
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
