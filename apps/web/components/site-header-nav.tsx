"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ChromeLink } from "../lib/site-chrome";

export function SiteHeaderNav({ links }: { links: ChromeLink[] }) {
  const pathname = usePathname() || "";

  if (links.length === 0) return null;

  return (
    <nav
      className="site-header__nav disinab-header__nav"
      aria-label="ناوبری اصلی"
    >
      <ul className="disinab-header__tabs" role="list">
        {links.map((link) => {
          const match = link.match || link.href;
          const current =
            pathname === match || pathname.startsWith(`${match}/`);
          return (
            <li key={`${link.href}-${link.label}`}>
              <Link
                href={link.href}
                className={
                  "site-header__link disinab-header__tab" +
                  (current ? " site-header__link--current is-active" : "")
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
