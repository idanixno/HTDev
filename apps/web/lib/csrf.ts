/**
 * Same-origin check for cookie-authenticated BFF mutations.
 *
 * Session cookie is SameSite=Lax (primary CSRF mitigation). This Origin/Referer
 * check is defense-in-depth for same-site cross-origin POSTs and misconfigured
 * clients. Skipped when Origin/Referer are both absent (some same-origin
 * navigations / older clients) only in development.
 */

import { siteUrl } from "./site-url";

function allowedOrigins(): string[] {
  const primary = siteUrl();
  const extras = (process.env.WEB_ORIGIN ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return Array.from(new Set([primary, ...extras]));
}

function originFromUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function assertSameOrigin(request: Request): Response | null {
  const allowed = allowedOrigins();
  const origin = originFromUrl(request.headers.get("origin"));
  const referer = originFromUrl(request.headers.get("referer"));
  const candidate = origin ?? referer;

  if (!candidate) {
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { message: "Origin required", error: "Forbidden" },
        { status: 403 },
      );
    }
    return null;
  }

  if (!allowed.includes(candidate)) {
    return Response.json(
      { message: "Cross-origin request blocked", error: "Forbidden" },
      { status: 403 },
    );
  }
  return null;
}
