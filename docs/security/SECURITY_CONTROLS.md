# Security controls — implementation map

Describes controls that exist in the repository today. Paths are relative to the monorepo root.

## Transport & browser headers

| Control | Implementation | Notes |
|---------|----------------|-------|
| Security headers (web) | `apps/web/lib/security-headers.ts` applied in `apps/web/middleware.ts` | `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, CSP |
| Security headers (API) | `apps/api/src/security/security-headers.middleware.ts` via `apps/api/src/main.ts` | Tight CSP for JSON API; strips `X-Powered-By` |
| HSTS | Opt-in `ENABLE_HSTS=true` only | **Not** tied to `NODE_ENV=production` alone — local HTTP stays usable |
| CORS | `apps/api/src/main.ts` `enableCors` | Origins from `WEB_ORIGIN` (comma-separated), credentials on |
| Hide Next powered-by | `apps/web/next.config.ts` `poweredByHeader: false` | |

## Authentication & sessions

| Control | Implementation | Notes |
|---------|----------------|-------|
| Password hashing | Argon2id (`apps/api/src/identity/password.service.ts`) | |
| Opaque sessions | `SessionService` — random token, SHA-256 stored | Cookie name `zharfa_session` |
| Cookie flags | Nest `identity.controller.ts` + Next BFF `apps/web/lib/session-cookie.ts` | HttpOnly, SameSite=Lax, Secure iff `NODE_ENV=production` |
| OTP recovery | Peppered hash, expiry, attempt cap (`otp.service.ts`) | |
| Auth gate (web) | `apps/web/middleware.ts` redirects unauthenticated `/dashboard`, `/admin`, `/payments`, `*/purchase` | |
| Role gate (API) | `AuthGuard` + commerce/admin `OwnerGuard` | OWNER vs STUDENT |

## CSRF

| Control | Implementation | Notes |
|---------|----------------|-------|
| SameSite=Lax cookies | Session cookie options | Primary mitigation for cross-site POSTs |
| Origin/Referer check | `apps/web/lib/csrf.ts` on auth BFF POST routes | login/register/logout/recover; production requires Origin or Referer |

No synchronizer CSRF token is issued. State-changing student/admin BFF routes rely on SameSite + same-origin fetch from first-party UI.

## Rate limiting

| Surface | Implementation | Backend |
|---------|----------------|---------|
| Auth endpoints | `RateLimitStubGuard` + `@RateLimitBucket` on identity controller | Redis (`REDIS_URL`) when connected; else in-memory Map |
| Notification EMAIL/SMS | `apps/api/src/notifications/rate-limit.ts` | In-memory per user+channel |

Env knobs: `AUTH_RATE_LIMIT`, `AUTH_RATE_WINDOW_MS`, `NOTIFY_RATE_LIMIT`, `NOTIFY_RATE_WINDOW_MS`.

**Limitation:** notification limiter and auth memory fallback are not multi-instance safe. Redis path for auth is best-effort (falls back if Redis is down).

## Uploads (ticket attachments)

| Control | File |
|---------|------|
| MIME allowlist + size (5 MiB) | `apps/api/src/tickets/attachment-rules.ts` |
| Filename sanitization / no path segments | same |
| Opaque storage keys `tickets/{id}/{uuid}.ext` | `buildAttachmentStorageKey` |
| Magic-byte verification vs declared MIME | `assertAttachmentMagicBytes` |
| Private root, reject `..` / absolute | `attachment-storage.ts` |
| Auth-only download | tickets controller |

## Payments & SpotPlayer

| Control | Notes |
|---------|-------|
| Server-side gateway verify | Browser return alone never marks `PAID` |
| Missing merchant creds | `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED`; UI disables paid purchase |
| `PAYMENT_MOCK_HOOKS` | Test-only; still requires verify |
| SpotPlayer | No invented license keys; masked credentials in API responses |

## SEO / crawl exposure (security-adjacent)

| Control | Implementation |
|---------|----------------|
| `robots.txt` | `apps/web/app/robots.ts` — allow public catalog; disallow admin/dashboard/auth/payments/api/design-system |
| Sitemap | `apps/web/app/sitemap.ts` — public home/courses/paths only |
| `noindex` metadata | layouts under `admin`, `dashboard`, `login`, `register`, `recover`, `payments`, `design-system` |
| `X-Robots-Tag` | middleware for private path prefixes |

## Validation

- Nest global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` (`main.ts`).

## Not yet implemented (tracked as residual)

- Redis-backed notification rate limits
- CI dependency audit / secret scanning
- MinIO signed URLs for attachments
- CSP nonces (script-src still allows `'unsafe-inline'` for Next App Router)
- Full synchronizer CSRF tokens for all mutating BFF routes
