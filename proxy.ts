import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionFromRequest, validateSession } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const token = getSessionFromRequest(request);

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await validateSession(token);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
