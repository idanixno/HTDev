import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "zharfa_session";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/payments") ||
      pathname.includes("/purchase")) &&
    !token
  ) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (
    token &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname.startsWith("/recover"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/payments/:path*",
    "/login",
    "/register",
    "/recover/:path*",
    "/",
    "/courses",
    "/courses/:path*",
    "/paths",
    "/paths/:path*",
    "/about",
    "/about/:path*",
    "/design-system",
    "/design-system/:path*",
  ],
};
