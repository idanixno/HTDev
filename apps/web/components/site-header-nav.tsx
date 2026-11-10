"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/courses", label: "دوره‌ها", match: "/courses" },
  { href: "/paths", label: "مسیرها", match: "/paths" },
  { href: "/journal", label: "مقالات", match: "/journal" },
] as const;

export function SiteHeaderNav() {
  const pathname = usePathname() || "";

  return (
    <nav className="site-header__nav" aria-label="ناوبری اصلی">
      <ul>
        {NAV_LINKS.map((link) => {
          const current =
            pathname === link.match || pathname.startsWith(`${link.match}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  "site-header__link" +
                  (current ? " site-header__link--current" : "")
                }
                aria-current={current ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
