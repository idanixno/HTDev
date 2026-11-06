import type { NextFunction, Request, Response } from "express";

/**
 * API response hardening headers.
 * HSTS only when ENABLE_HSTS=true — never inferred from NODE_ENV alone,
 * so local HTTP development is not broken.
 */
export function securityHeadersMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  // API returns JSON; CSP is mainly for HTML — still set a tight default.
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  );
  res.removeHeader("X-Powered-By");

  if (process.env.ENABLE_HSTS === "true") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  next();
}
