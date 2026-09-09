import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "./app/lib/authConstants";
import { isJwtLive } from "./app/lib/jwt";

// Optimistic routing. This layer checks the token's `exp` claim (NOT its
// signature) so an expired cookie can't trap the user in a /login <-> /trips
// redirect bounce, and purges a dead cookie on the way through. Real auth is
// enforced by the backend (`get_current_user`) and `getSession()` — a forged
// token still 401s on every data call and the AuthProvider logs the user out.
export const config = {
  matcher: [
    "/trips/:path*",
    "/profile/:path*",
    "/assistant/:path*",
    "/plan/:path*",
    "/login",
    "/register",
  ],
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const live = isJwtLive(token);
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // a genuinely logged-in user has no business on the login/register pages
  if (live && isAuthPage) {
    return NextResponse.redirect(new URL("/trips", request.url));
  }

  // no live session on a protected route -> send to login (remembering where)
  if (!live && !isAuthPage) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(AUTH_COOKIE);
    return res;
  }

  // let it through; if a dead cookie is riding along (e.g. on /login), clear it
  const res = NextResponse.next();
  if (token && !live) res.cookies.delete(AUTH_COOKIE);
  return res;
}
