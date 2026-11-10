import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "./lib/security-headers";

const SESSION_COOKIE_NAME = "zharfa_session";

function isHiddenAdmin(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/dashboard/admin" ||
    pathname.startsWith("/dashboard/admin/")
  );
}

async function isOwner(token: string) {
  const api =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:4000";
  try {
    const res = await fetch(`${api}/identity/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-session-token": token,
      },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { user?: { role?: string } };
    return data.user?.role === "OWNER";
  } catch {
    return false;
  }
}

const SUSPICIOUS_PATH =
  /^\/(\.env|wp-admin|wp-login|phpmyadmin|\.git|backup|config\.json|actuator|server-status|vendor\/|debug\/)/i;

function reportSuspiciousProbe(request: NextRequest, pathname: string) {
  if (!SUSPICIOUS_PATH.test(pathname)) return;
  const api =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:4000";
  const hook =
    process.env.INTERNAL_SECURITY_TOKEN?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (!hook) return;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  void fetch(`${api}/internal/security/probe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-token": hook,
    },
    body: JSON.stringify({
      path: pathname,
      method: request.method,
      ip,
      userAgent: request.headers.get("user-agent"),
    }),
  }).catch(() => undefined);
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;
  const isDev = process.env.NODE_ENV !== "production";
  const enableHsts = process.env.ENABLE_HSTS === "true";
  const hiddenAdmin = isHiddenAdmin(pathname);
  reportSuspiciousProbe(request, pathname);
  const owner = hiddenAdmin && token ? await isOwner(token) : false;

  if (hiddenAdmin && !owner) {
    if (process.env.MAINTENANCE_MODE === "true") {
      const redirect = NextResponse.redirect(new URL("/maintenance", request.url));
      applySecurityHeaders(redirect.headers, { pathname, isDev, enableHsts });
      return redirect;
    }
    const rewrite = NextResponse.rewrite(new URL("/internal-missing", request.url));
    applySecurityHeaders(rewrite.headers, { pathname, isDev, enableHsts });
    return rewrite;
  }

  if (
    process.env.MAINTENANCE_MODE === "true" &&
    pathname !== "/maintenance" &&
    !(hiddenAdmin && owner) &&
    !pathname.startsWith("/api/") &&
    pathname !== "/login" &&
    !pathname.startsWith("/recover")
  ) {
    const redirect = NextResponse.redirect(new URL("/maintenance", request.url));
    applySecurityHeaders(redirect.headers, { pathname, isDev, enableHsts });
    return redirect;
  }

  if (
    !hiddenAdmin &&
    (pathname.startsWith("/dashboard") ||
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
