import { auth } from "@/auth";

export default auth((req) => {
  const isLogged = !!req.auth;
  if (!isLogged) {
    return Response.redirect(new URL("/login", req.url));
  }
  return undefined;
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
