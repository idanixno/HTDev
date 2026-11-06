import Link from "next/link";
import { Button } from "@zharfa/ui";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/courses", label: "دوره‌ها", current: true },
  { href: "/paths", label: "مسیرهای یادگیری" },
  { href: "/about", label: "درباره مدرس" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-brand">
          <span className="site-brand__name">ژرفا</span>
          <span className="site-brand__tag">اطلس یادگیری عمیق</span>
        </Link>

        <nav className="site-header__nav" aria-label="ناوبری اصلی">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                "site-header__link" +
                ("current" in link && link.current
                  ? " site-header__link--current"
                  : "")
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          <Button variant="secondary" type="button">
            ورود / حساب من
          </Button>
        </div>
      </div>
    </header>
  );
}
