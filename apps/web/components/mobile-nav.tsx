"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "./theme-toggle";
import { useMenuDrawer } from "./use-menu-drawer";

const GROUPS = [
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
] as const;

export function MobileNav({ authed }: { authed: boolean }) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  const { open, close, toggle } = useMenuDrawer("(max-width: 1100px)");

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav__toggle"
        aria-label="منو"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={toggle}
      >
        <span className="mobile-nav__icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      {open
        ? createPortal(
            <>
              <button
                type="button"
                className="nav-drawer__scrim"
                aria-label="بستن منو"
                onClick={close}
              />
              <nav
                ref={panelRef}
                id="mobile-nav-panel"
                className="nav-drawer__panel"
                role="dialog"
                aria-modal="true"
                aria-label="منوی صفحه"
                tabIndex={-1}
              >
                <div className="nav-drawer__bar">
                  <p>منو</p>
                  <button type="button" className="nav-drawer__close" onClick={close}>
                    بستن
                  </button>
                </div>
                <div className="nav-drawer__body">
                  {GROUPS.map((group) => (
                    <section key={group.label} className="mobile-nav__group">
                      <p className="mobile-nav__label">{group.label}</p>
                      <ul>
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              aria-current={
                                pathname === link.href ||
                                pathname.startsWith(`${link.href}/`)
                                  ? "page"
                                  : undefined
                              }
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                  <section className="mobile-nav__group">
                    <p className="mobile-nav__label">حساب</p>
                    <ul>
                      <li>
                        <Link
                          href="/cart"
                          aria-current={pathname === "/cart" ? "page" : undefined}
                        >
                          سبد خرید
                        </Link>
                      </li>
                      <li>
                        <Link href={authed ? "/dashboard" : "/login"}>
                          {authed ? "حساب من" : "ورود"}
                        </Link>
                      </li>
                    </ul>
                    <ThemeToggle />
                  </section>
                </div>
              </nav>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
