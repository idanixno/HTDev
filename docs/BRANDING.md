# DXCode branding

**Product brand:** DXCode  
**Visual system:** Knowledge Portal / Interlocking Knowledge (cyan `#29D8FF` · electric blue `#276BFF` · violet `#7657F6` · navy `#070B16`)

## Typography

| Role | Font | Token | Usage |
|------|------|-------|--------|
| Brand wordmark | **Orbitron** | `--dx-font-brand` | `DXCode` in header/footer/auth/admin |
| Tech kicker | **JetBrains Mono** | `--dx-font-tech` | `LEARN · BUILD · GROW`, overlines |
| Persian UI | **IRANSans** | `--zharfa-font-persian` | All Persian body/UI |
| Latin UI | **Plus Jakarta Sans** | `--zharfa-font-latin` | Mixed English UI (not wordmark) |
| Code | **JetBrains Mono** | `--zharfa-font-code` | Code fields / samples |

Wordmark component: `apps/web/components/dxcode-wordmark.tsx`  
Portal mark: `apps/web/components/dxcode-logo.tsx` (hexagon + cyan `>`)

## Canonical source of truth

Site chrome (header/footer brand name, tagline, blurb, nav groups) lives in Postgres:

- Table: `CmsFooterContent` (singleton `id = 'footer'`)
- Admin: `/admin/cms` → هدر و فوتر
- Public API: `GET /catalog/footer-trusts` (merged with code defaults in `apps/api/src/cms/site-chrome.ts`)
- Web consumes the API response as-is (`fetchSiteChrome`) — **no client remapping** of legacy names.

Code defaults in `DEFAULT_SITE_CHROME` (API + web) are DXCode and apply only when the CMS row is missing or a field is empty.

## Remaining internal identifiers (intentional)

These are **not** user-facing brand strings. Do not rename without a dedicated migration plan:

| Identifier | Kind |
|------------|------|
| `@zharfa/*` packages | npm workspace names |
| `--zharfa-*` CSS tokens | design-token CSS variables |
| `zharfa_session` cookie | auth session cookie name |
| `zharfa-jobs` BullMQ queue | worker queue name |
| Docker/`POSTGRES_*` `zharfa` | local/prod infra names |
| File aliases `zharfa-logo.tsx` | back-compat re-export of `DxCodeLogo` |

## Assets

- Logo component: `apps/web/components/dxcode-logo.tsx`
- Favicon: `apps/web/app/icon.tsx` (App Router generated icon)
- Course/journal placeholders: `apps/web/public/artwork/**` (mark text `DXCODE`)
