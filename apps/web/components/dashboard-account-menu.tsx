"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "نمای کلی", exact: true },
  { href: "/dashboard/tracks", label: "تخصص‌ها" },
  { href: "/dashboard/tickets", label: "پشتیبانی" },
] as const;

export function DashboardAccountMenu() {
  const pathname = usePathname() || "/dashboard";

  return (
    <nav className="disinab-account-menu" aria-label="حساب من">
      <ul>
        {LINKS.map((link) => {
          const current =
            "exact" in link && link.exact
              ? pathname === link.href
              : pathname === link.href ||
                pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
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
