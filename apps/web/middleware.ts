import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "./lib/security-headers";

const SESSION_COOKIE_NAME = "zharfa_session";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;
  const isDev = process.env.NODE_ENV !== "production";
  const enableHsts = process.env.ENABLE_HSTS === "true";

  if (
    process.env.MAINTENANCE_MODE === "true" &&
    pathname !== "/maintenance" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api/") &&
    pathname !== "/login" &&
    !pathname.startsWith("/recover")
  ) {
    const redirect = NextResponse.redirect(new URL("/maintenance", request.url));
    applySecurityHeaders(redirect.headers, { pathname, isDev, enableHsts });
    return redirect;
  }

  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/payments") ||
      pathname.includes("/purchase")) &&
    !token
  ) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    const redirect = NextResponse.redirect(login);
    applySecurityHeaders(redirect.headers, { pathname, isDev, enableHsts });
    return redirect;
  }

  if (
    token &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname.startsWith("/recover"))
  ) {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    applySecurityHeaders(redirect.headers, { pathname, isDev, enableHsts });
    return redirect;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  applySecurityHeaders(response.headers, { pathname, isDev, enableHsts });
  return response;
}

export const config = {
  matcher: [
    /*
     * Apply auth gates + security headers to app routes.
     * Exclude Next internals and static assets (robots/sitemap are included).
     */
    "/((?!_next/static|_next/image|favicon.ico|artwork/).*)",
  ],
};
