import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants";
import { getSessionFromRequest, validateSession } from "@/lib/auth";
import { getPostLoginRoute } from "@/lib/navigation";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const token = getSessionFromRequest(request);

  if (!token) {
    if (pathname === ROUTES.LOGIN) return NextResponse.next();
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  const user = await validateSession(token);
  if (!user) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  const postLoginRoute = getPostLoginRoute(user);

  if (pathname === ROUTES.LOGIN) {
    return NextResponse.redirect(new URL(postLoginRoute, request.url));
  }

  if (user.mustChangePassword && pathname !== ROUTES.ALTERAR_SENHA) {
    return NextResponse.redirect(new URL(ROUTES.ALTERAR_SENHA, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
