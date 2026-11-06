import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@zharfa/ui";
import { ThemeToggle } from "./theme-toggle";
import { fetchCurrentUser } from "../lib/session";

const NAV_LINKS = [
  { href: "/courses", label: "دوره‌ها", match: "/courses" },
  { href: "/paths", label: "مسیرهای یادگیری", match: "/paths" },
  { href: "/about", label: "درباره مدرس", match: "/about" },
] as const;

export async function SiteHeader() {
  const user = await fetchCurrentUser();
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-brand">
          <span className="site-brand__name">ژرفا</span>
          <span className="site-brand__tag">اطلس یادگیری عمیق</span>
        </Link>

        <nav className="site-header__nav" aria-label="ناوبری اصلی">
          {NAV_LINKS.map((link) => {
            const current =
              pathname === link.match || pathname.startsWith(`${link.match}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "site-header__link" +
                  (current ? " site-header__link--current" : "")
                }
                aria-current={current ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          {user ? (
            <Button href="/dashboard" variant="secondary">
              حساب من
            </Button>
          ) : (
            <Button href="/login" variant="secondary">
              ورود / حساب من
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
