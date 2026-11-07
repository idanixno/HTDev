"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/courses", label: "دوره‌ها" },
  { href: "/paths", label: "مسیرهای یادگیری" },
  { href: "/journal", label: "یادداشت‌ها" },
  { href: "/about", label: "درباره" },
  { href: "/faq", label: "پرسش‌ها" },
  { href: "/contact", label: "تماس" },
] as const;

export function MobileNav({ authed }: { authed: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav__toggle"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "بستن" : "منو"}
      </button>
      {open ? (
        <nav id="mobile-nav-panel" className="mobile-nav__panel" aria-label="منوی موبایل">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link href={authed ? "/dashboard" : "/login"}>
            {authed ? "حساب من" : "ورود"}
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
