/** Defaults + sanitizers for site header/footer CMS chrome. */

export type ChromeLink = {
  href: string;
  label: string;
  match?: string;
};

export type ChromeGroup = {
  label: string;
  links: ChromeLink[];
};

export type SiteChrome = {
  brandName: string;
  brandTagline: string;
  brandKicker: string;
  footerBlurb: string;
  headerLinks: ChromeLink[];
  footerGroups: ChromeGroup[];
  mobileGroups: ChromeGroup[];
  guestCtaLabel: string;
  guestCtaHref: string;
  authedCtaLabel: string;
  authedCtaHref: string;
  showCart: boolean;
  showThemeToggle: boolean;
  trustsLabel: string;
  mobileMenuTitle: string;
  mobileMenuLine: string;
  enamadHtml: string | null;
  paymentGatewayHtml: string | null;
};

export const DEFAULT_SITE_CHROME: SiteChrome = {
  brandName: "DXCode",
  brandTagline: "LEARN · BUILD · GROW",
  brandKicker: "استودیو",
  footerBlurb:
    "DXCode جایی است برای یادگیری عمیق فناوری؛ از اولین مسئله تا تصمیم‌های مهندسی. دوره، مسیر روشن و تمرین واقعی — تا مهارت قابل‌اتکا بسازی، نه فقط تئوری حفظ‌کردنی.",
  headerLinks: [
    { href: "/courses", label: "دوره‌ها", match: "/courses" },
    { href: "/paths", label: "مسیرها", match: "/paths" },
    { href: "/journal", label: "مقالات", match: "/journal" },
  ],
  footerGroups: [
    {
      label: "یادگیری",
      links: [
        { href: "/courses", label: "دوره‌ها" },
        { href: "/paths", label: "مسیرهای یادگیری" },
        { href: "/journal", label: "مقالات" },
      ],
    },
  ],
  mobileGroups: [
    {
      label: "یادگیری",
      links: [
        { href: "/courses", label: "دوره‌ها" },
        { href: "/paths", label: "مسیرهای یادگیری" },
        { href: "/journal", label: "مقالات" },
      ],
    },
  ],
  guestCtaLabel: "ورود",
  guestCtaHref: "/login",
  authedCtaLabel: "حساب من",
  authedCtaHref: "/dashboard",
  showCart: false,
  showThemeToggle: true,
  trustsLabel: "اعتماد و پرداخت",
  mobileMenuTitle: "منو",
  mobileMenuLine: "دوره‌ها، مسیرها و حساب — یک صفحه.",
  enamadHtml: null,
  paymentGatewayHtml: null,
};

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function cleanHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (!href) return null;
  if (href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://")) {
    return href.slice(0, 300);
  }
  return null;
}

function isRetiredPage(href: string): boolean {
  let pathname: string;
  if (href.startsWith("/")) {
    pathname = href.split(/[?#]/, 1)[0] ?? "";
  } else {
    try {
      pathname = new URL(href).pathname;
    } catch {
      return false;
    }
  }
  return ["/faq", "/terms"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function parseChromeLinks(raw: unknown, fallback: ChromeLink[]): ChromeLink[] {
  if (!Array.isArray(raw)) return fallback;
  const links: ChromeLink[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const href = cleanHref(row.href);
    const label = cleanText(row.label, 60);
    if (!href || !label || isRetiredPage(href)) continue;
    const match = cleanText(row.match, 120) ?? href;
    links.push({ href, label, match });
    if (links.length >= 12) break;
  }
  return links.length > 0 ? links : fallback;
}

export function parseChromeGroups(
  raw: unknown,
  fallback: ChromeGroup[],
): ChromeGroup[] {
  if (!Array.isArray(raw)) return fallback;
  const groups: ChromeGroup[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const rawLabel = cleanText(row.label, 40);
    if (!rawLabel) continue;
    const label = rawLabel === "DXCode" ? "درباره" : rawLabel;
    const links = parseChromeLinks(row.links, []);
    if (links.length === 0) continue;
    groups.push({ label, links });
    if (groups.length >= 6) break;
  }
  return groups.length > 0 ? groups : fallback;
}

export function mergeSiteChrome(row: {
  brandName?: string | null;
  brandTagline?: string | null;
  brandKicker?: string | null;
  footerBlurb?: string | null;
  headerLinks?: unknown;
  footerGroups?: unknown;
  mobileGroups?: unknown;
  guestCtaLabel?: string | null;
  guestCtaHref?: string | null;
  authedCtaLabel?: string | null;
  authedCtaHref?: string | null;
  showCart?: boolean | null;
  showThemeToggle?: boolean | null;
  trustsLabel?: string | null;
  mobileMenuTitle?: string | null;
  mobileMenuLine?: string | null;
  enamadHtml?: string | null;
  paymentGatewayHtml?: string | null;
} | null): SiteChrome {
  const d = DEFAULT_SITE_CHROME;
  if (!row) return { ...d, headerLinks: [...d.headerLinks], footerGroups: structuredClone(d.footerGroups), mobileGroups: structuredClone(d.mobileGroups) };

  return {
    brandName: cleanText(row.brandName, 40) ?? d.brandName,
    brandTagline: cleanText(row.brandTagline, 80) ?? d.brandTagline,
    brandKicker: cleanText(row.brandKicker, 40) ?? d.brandKicker,
    footerBlurb: cleanText(row.footerBlurb, 900) ?? d.footerBlurb,
    headerLinks: parseChromeLinks(row.headerLinks, d.headerLinks),
    footerGroups: parseChromeGroups(row.footerGroups, d.footerGroups),
    mobileGroups: parseChromeGroups(
      row.mobileGroups ?? row.footerGroups,
      d.mobileGroups,
    ),
    guestCtaLabel: cleanText(row.guestCtaLabel, 40) ?? d.guestCtaLabel,
    guestCtaHref: cleanHref(row.guestCtaHref) ?? d.guestCtaHref,
    authedCtaLabel: cleanText(row.authedCtaLabel, 40) ?? d.authedCtaLabel,
    authedCtaHref: cleanHref(row.authedCtaHref) ?? d.authedCtaHref,
    showCart: false,
    showThemeToggle: row.showThemeToggle ?? d.showThemeToggle,
    trustsLabel: cleanText(row.trustsLabel, 60) ?? d.trustsLabel,
    mobileMenuTitle: cleanText(row.mobileMenuTitle, 40) ?? d.mobileMenuTitle,
    mobileMenuLine: cleanText(row.mobileMenuLine, 160) ?? d.mobileMenuLine,
    enamadHtml: row.enamadHtml?.trim() || null,
    paymentGatewayHtml: row.paymentGatewayHtml?.trim() || null,
  };
}
