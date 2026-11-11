"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { ChromeGroup } from "../lib/site-chrome";
import { DisinabStatus } from "./disinab";
import { DxCodeWordmark } from "./dxcode-wordmark";
import { useSessionAuthed } from "./header-account";
import { ThemeToggle } from "./theme-toggle";
import { useMenuDrawer } from "./use-menu-drawer";

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DrawerLink({
  href,
  current,
  className,
  onNavigate,
  children,
}: {
  href: string;
  current?: boolean;
  className: string;
  onNavigate: (href: string, current: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      aria-current={current ? "page" : undefined}
      prefetch
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onNavigate(href, Boolean(current));
      }}
    >
      {children}
    </Link>
  );
}

export function MobileNav({
  groups,
  brandName,
  menuTitle,
  menuLine,
  guestCtaLabel,
  guestCtaHref,
  authedCtaLabel,
  authedCtaHref,
  showThemeToggle = true,
}: {
  groups: ChromeGroup[];
  brandName: string;
  menuTitle: string;
  menuLine: string;
  guestCtaLabel: string;
  guestCtaHref: string;
  authedCtaLabel: string;
  authedCtaHref: string;
  showThemeToggle?: boolean;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const panelRef = useRef<HTMLElement>(null);
  const { open, close, toggle } = useMenuDrawer("(max-width: 1100px)");
  const authed = useSessionAuthed();

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  function navigate(href: string, current: boolean) {
    if (!current) {
      router.push(href);
    }
    window.setTimeout(() => {
      close();
    }, 0);
  }

  const accountHref = authed ? authedCtaHref : guestCtaHref;
  const accountLabel = authed ? authedCtaLabel : guestCtaLabel;
  const accountCurrent = authed
    ? pathname === authedCtaHref || pathname.startsWith(`${authedCtaHref}/`)
    : pathname === guestCtaHref;

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
                className="nav-drawer__scrim disinab-nav-drawer__scrim"
                aria-label="بستن منو"
                onClick={close}
              />
              <nav
                ref={panelRef}
                id="mobile-nav-panel"
                className="nav-drawer__panel disinab-nav-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="منوی صفحه"
                tabIndex={-1}
              >
                <div className="disinab-nav-drawer__aura" aria-hidden="true" />
                <div className="disinab-nav-drawer__inner">
                  <header className="disinab-nav-drawer__head">
                    <div className="disinab-nav-drawer__title">
                      {brandName === "DXCode" ? (
                        <DxCodeWordmark as="p" className="disinab__brand" />
                      ) : (
                        <p className="disinab__brand">{brandName}</p>
                      )}
                      <h2>{menuTitle}</h2>
                      <p className="disinab__line">{menuLine}</p>
                    </div>
                    <button
                      type="button"
                      className="disinab-nav-drawer__close"
                      aria-label="بستن"
                      onClick={close}
                    >
                      <svg
                        className="disinab-nav-drawer__close-icon"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </header>

                  <div className="disinab-nav-drawer__body">
                    <ul className="disinab-nav-drawer__list">
                      <li>
                        <DrawerLink
                          href={accountHref}
                          current={accountCurrent}
                          className={
                            "disinab-nav-drawer__link" +
                            (accountCurrent ? " is-current" : "")
                          }
                          onNavigate={navigate}
                        >
                          <span>{accountLabel}</span>
                          {accountCurrent ? (
                            <span
                              className="disinab-nav-drawer__dot"
                              aria-hidden="true"
                            />
                          ) : null}
                        </DrawerLink>
                      </li>
                      {groups.flatMap((group) =>
                        group.links.map((link) => {
                          const current = isCurrent(pathname, link.href);
                          return (
                            <li key={`${link.href}-${link.label}`}>
                              <DrawerLink
                                href={link.href}
                                current={current}
                                className={
                                  "disinab-nav-drawer__link" +
                                  (current ? " is-current" : "")
                                }
                                onNavigate={navigate}
                              >
                                <span>{link.label}</span>
                                {current ? (
                                  <span
                                    className="disinab-nav-drawer__dot"
                                    aria-hidden="true"
                                  />
                                ) : null}
                              </DrawerLink>
                            </li>
                          );
                        }),
                      )}
                      <li>
                        <DrawerLink
                          href="/cart"
                          current={pathname === "/cart"}
                          className={
                            "disinab-nav-drawer__link" +
                            (pathname === "/cart" ? " is-current" : "")
                          }
                          onNavigate={navigate}
                        >
                          <span>سبد خرید</span>
                          {pathname === "/cart" ? (
                            <span
                              className="disinab-nav-drawer__dot"
                              aria-hidden="true"
                            />
                          ) : null}
                        </DrawerLink>
                      </li>
                    </ul>
                  </div>

                  <footer className="disinab-nav-drawer__foot">
                    <DisinabStatus host="zharfa.ir" live />
                    {showThemeToggle ? <ThemeToggle /> : null}
                  </footer>
                </div>
              </nav>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
