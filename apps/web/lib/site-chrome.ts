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
  brandName: "ژرفا",
  brandTagline: "اطلس یادگیری عمیق",
  brandKicker: "استودیو",
  footerBlurb:
    "ژرفا اطلس یادگیری عمیقِ آرمان راد است؛ از اولین مسئله تا تصمیم‌های معماری، با دوره و مسیر روشن.",
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
    {
      label: "ژرفا",
      links: [
        { href: "/faq", label: "پرسش‌های رایج" },
        { href: "/terms", label: "شرایط استفاده" },
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
    {
      label: "ژرفا",
      links: [
        { href: "/faq", label: "پرسش‌ها" },
        { href: "/terms", label: "شرایط استفاده" },
      ],
    },
  ],
  guestCtaLabel: "ورود",
  guestCtaHref: "/login",
  authedCtaLabel: "حساب من",
  authedCtaHref: "/dashboard",
  showCart: true,
  showThemeToggle: true,
  trustsLabel: "اعتماد و پرداخت",
  mobileMenuTitle: "منو",
  mobileMenuLine: "دوره‌ها، مسیرها و حساب — یک صفحه.",
  enamadHtml: null,
  paymentGatewayHtml: null,
};

