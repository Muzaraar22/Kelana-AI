import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "./app/lib/authConstants";

// Optimistic redirects based on cookie *presence* only (no secret at this layer).
// Real validation happens in the backend dependency + getSession(); an expired
// cookie still 401s on the data call and the AuthProvider handles it.
export const config = {
  matcher: ["/trips/:path*", "/profile/:path*", "/login", "/register"],
};

export function proxy(request: NextRequest) {
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE)?.value);
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!hasToken && !isAuthPage) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL("/trips", request.url));
  }

  return NextResponse.next();
}
