/**
 * Same-origin relative path only — blocks open redirects via ?next=.
 * Rejects protocol-relative, absolute URLs, backslashes, and encoded tricks.
 */
export function safeNextPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  value = value.trim();
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  if (value.includes("://")) return fallback;
  if (/[\s<>"]/.test(value)) return fallback;
  if (value.length > 512) return fallback;
  return value;
}

/** Allow only configured public web origins for payment callback redirects. */
export function safeWebOrigin(raw: string | null | undefined): string {
  const configured = [
    process.env.WEB_ORIGIN ?? "",
    process.env.NEXT_PUBLIC_SITE_URL ?? "",
  ]
    .flatMap((s) => s.split(","))
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);

  const defaults =
    process.env.NODE_ENV === "production"
      ? configured
      : [
          ...configured,
          "http://localhost:3000",
          "http://127.0.0.1:3000",
        ];

  const allow = Array.from(new Set(defaults));
  if (!raw?.trim()) {
    return allow[0] ?? "http://localhost:3000";
  }
  try {
    const url = new URL(raw.trim());
    const origin = url.origin;
    if (allow.includes(origin)) return origin;
  } catch {
    /* ignore */
  }
  return allow[0] ?? "http://localhost:3000";
}

const GATEWAY_HOST_SUFFIXES = [
  "zarinpal.com",
  "www.zarinpal.com",
  "payment.zarinpal.com",
  "sandbox.zarinpal.com",
  "aqayepardakht.ir",
  "panel.aqayepardakht.ir",
];

/** Gateway redirect URLs only — blocks open redirect on /payments/pending?next= */
export function safeGatewayRedirectUrl(
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
      return null;
    }
    const host = url.hostname.toLowerCase();
    const ok = GATEWAY_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    );
    return ok ? url.toString() : null;
  } catch {
    return null;
  }
}
