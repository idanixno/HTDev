import Link from "next/link";

const LEARN = [
  { href: "/courses", label: "دوره‌ها" },
  { href: "/paths", label: "مسیرهای یادگیری" },
  { href: "/journal", label: "یادداشت‌ها" },
  { href: "/faq", label: "پرسش‌های رایج" },
] as const;

const STUDIO = [
  { href: "/about", label: "درباره ژرفا" },
  { href: "/contact", label: "تماس و پشتیبانی" },
  { href: "/terms", label: "شرایط استفاده" },
  { href: "/privacy", label: "حریم خصوصی" },
  { href: "/refunds", label: "بازپرداخت" },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__name">ژرفا</p>
          <p>
            آموزش فنی یک مدرس. هر دوره جدا فروخته می‌شود و ویدیوی محافظت‌شده در
            اسپات‌پلیر پخش می‌شود.
          </p>
        </div>
        <nav aria-label="یادگیری">
          <p className="site-footer__label">یادگیری</p>
          <ul>
            {LEARN.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="ژرفا">
          <p className="site-footer__label">ژرفا</p>
          <ul>
            {STUDIO.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
