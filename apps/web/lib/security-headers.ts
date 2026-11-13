/**
 * Browser security headers for the Next.js edge/middleware layer.
 *
 * HSTS is opt-in via ENABLE_HSTS=true so local HTTP/dev is never broken by
 * production-only assumptions. NODE_ENV=production alone does not enable HSTS.
 */

export type SecurityHeaderMap = Record<string, string>;

const PRIVATE_PREFIXES = [
  "/admin",
  "/dashboard",
  "/login",
  "/register",
  "/recover",
  "/payments",
  "/api",
  "/design-system",
] as const;

export function isPrivatePath(pathname: string): boolean {
  if (pathname.includes("/purchase")) return true;
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function apiConnectSources(isDev: boolean): string {
  const sources = new Set<string>(["'self'"]);
  // Browser CSP must only list public origins — never Docker/internal hosts.
  const candidates = [process.env.NEXT_PUBLIC_API_URL];
  if (isDev) {
    candidates.push(
      process.env.API_INTERNAL_URL,
      "http://localhost:4000",
      "http://127.0.0.1:4000",
    );
  }
  for (const raw of candidates) {
    if (!raw?.trim()) continue;
    try {
      const origin = new URL(raw.trim()).origin;
      // Keep production CSP on https public hosts only.
      if (!isDev && origin.startsWith("http://")) continue;
      if (!isDev && /^(http:\/\/)?(localhost|127\.|api:|0\.0\.0\.0)/i.test(origin)) {
        continue;
      }
      sources.add(origin);
    } catch {
      /* ignore invalid */
    }
  }
  return [...sources].join(" ");
}

/**
 * CSP is intentionally CSP-friendly for Next App Router:
 * - 'unsafe-inline' for styles (CSS-in-JS / next/font style tags)
 * - 'unsafe-eval' only in development for Next tooling
 * Tighten further with nonces once a nonce pipeline exists.
 */
export function buildContentSecurityPolicy(isDev: boolean): string {
  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-inline'";
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${apiConnectSources(isDev)}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

export function buildSecurityHeaders(options: {
  pathname: string;
  isDev: boolean;
  enableHsts: boolean;
}): SecurityHeaderMap {
  const headers: SecurityHeaderMap = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Content-Security-Policy": buildContentSecurityPolicy(options.isDev),
  };

  if (options.enableHsts) {
    headers["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains";
  }

  if (isPrivatePath(options.pathname)) {
    headers["X-Robots-Tag"] = "noindex, nofollow";
  }

  return headers;
}

export function applySecurityHeaders(
  target: Headers,
  options: { pathname: string; isDev: boolean; enableHsts: boolean },
): void {
  const map = buildSecurityHeaders(options);
  for (const [key, value] of Object.entries(map)) {
    target.set(key, value);
  }
}
