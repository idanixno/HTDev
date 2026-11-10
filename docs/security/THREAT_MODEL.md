# Threat model — Zharfa (as implemented)

Scope: local-first personal education platform (one instructor). Persian RTL web + Nest API + Postgres + Redis/BullMQ + private ticket attachment store. This describes **actual** risks and controls in the current codebase, not a future production hardening wishlist.

## Assets

| Asset | Where it lives | Sensitivity |
|-------|----------------|-------------|
| Student / owner accounts | Postgres `User` + Argon2id hashes | High |
| Session tokens | HttpOnly cookie `zharfa_session`; only SHA-256 hash in `Session` | High |
| OTP recovery codes | SHA-256(pepper + code) in `OtpChallenge` | High |
| Orders / payments | Postgres; gateway verify on server | High (money) |
| SpotPlayer API key | Env and/or encrypted DB setting; responses masked | High |
| Ticket attachments | Private disk under `TICKET_ATTACHMENT_ROOT` / `.data` | Medium–High |
| Unpublished courses / CMS | Postgres; admin OwnerGuard | Medium |
| Public catalog | Published courses/paths only | Low |

## Actors

- **Anonymous visitor** — public catalog, home, paths.
- **Student** — authenticated session; dashboard, orders, tickets, notifications, free-access grant.
- **Owner** — `UserRole.OWNER`; `/admin/*` + Nest `/admin/*` with `OwnerGuard`.
- **Payment gateways** — ZarinPal / AqayePardakht callback to API verify endpoints.
- **SpotPlayer API** — license create; worker provisioning.
- **Attacker** — CSRF, credential stuffing, attachment abuse, IDOR, scraping private surfaces, payment spoofing.

## Trust boundaries

1. Browser ↔ Next.js (`apps/web`) — cookies, BFF `/api/*` proxies.
2. Next BFF ↔ Nest API (`apps/api`) — server-side `API_INTERNAL_URL`; CORS for browser→API when used.
3. Nest ↔ Postgres / Redis / filesystem attachments.
4. Nest / worker ↔ external gateways (ZarinPal, AqayePardakht, SpotPlayer).

## Key threats and current posture

| Threat | Status in code | Residual risk |
|--------|----------------|---------------|
| Fake payment success via browser return | Mitigated: adapters require server verify; missing creds → `IMPLEMENTED_BUT_CREDENTIALS_REQUIRED` | Operator must not enable `PAYMENT_MOCK_HOOKS` in prod |
| Invented SpotPlayer licenses | Mitigated: no fake keys; seed never SUCCEEDED | Missing API key leaves licenses pending |
| Session theft (XSS) | Mitigated: HttpOnly + CSP baseline + SameSite=Lax | CSP still allows `'unsafe-inline'` scripts for Next |
| CSRF on cookie auth | Mitigated: SameSite=Lax + Origin/Referer check on auth BFF POSTs | No synchronizer CSRF token yet |
| Auth brute-force | Mitigated: rate limit per IP+bucket (Redis if up, else memory) | Memory limiter is per-process; multi-instance needs Redis |
| Account enumeration on recovery | Mitigated: uniform response shape | Timing side-channels not fully equalized |
| Ticket attachment malware / XSS / path traversal | Mitigated: MIME allowlist, size cap, magic bytes, content heuristics (XSS/PDF JS/EICAR), optional ClamAV, opaque keys, `..` reject, auth download with nosniff+CSP sandbox | ClamAV optional unless `CLAMAV_REQUIRED`; local disk not MinIO yet |
| Admin access by obscurity | Mitigated: `OwnerGuard` + web `requireOwner` | Session fixation not separately rotated on privilege change (single role model) |
| Private page indexing | Mitigated: `robots.txt` disallow + metadata `noindex` + `X-Robots-Tag` | Misconfigured `NEXT_PUBLIC_SITE_URL` can skew sitemap host |
| Dependency / supply chain | Not automated in CI yet | Manual review still required |

## Out of scope (honest)

- Multi-tenant marketplace isolation
- Custom video DRM beyond SpotPlayer
- Production WAF, bot management, secret scanning CI
- Object-storage signed URLs (attachments remain local private root)

## Related docs

- [SECURITY_CONTROLS.md](./SECURITY_CONTROLS.md) — control inventory mapped to code
- Root [SECURITY.md](../../SECURITY.md) — operator-facing summary
