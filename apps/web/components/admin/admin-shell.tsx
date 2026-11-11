"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { ThemeToggle } from "../theme-toggle";
import { LogoutButton } from "../logout-button";
import { useMenuDrawer } from "../use-menu-drawer";
import { DxCodeLogo } from "../dxcode-logo";
import { DxCodeWordmark } from "../dxcode-wordmark";
import { AdminLiveBadge } from "./live-badge";
import { ADMIN_MENU, isAdminNavCurrent } from "./admin-nav";
import { AdminNavIcon } from "./admin-nav-icons";
import { AdminNavPending } from "./admin-nav-pending";

export function AdminShell({
  displayName,
  badges = {},
  children,
}: {
  displayName: string;
  badges?: Record<string, number>;
  children: ReactNode;
}) {
  const pathname = usePathname() || "/admin";
  const panelRef = useRef<HTMLElement>(null);
  const { open, narrow, close, toggle } = useMenuDrawer("(max-width: 900px)");

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    panel.focus({ preventScroll: true });
    const nav = panel.querySelector<HTMLElement>(".admin-shell__nav");
    if (nav) nav.scrollTop = 0;
    panel.scrollTop = 0;
  }, [open]);

  return (
    <div
      className={
        "admin-shell disinab-admin" + (open ? " is-menu-open" : "")
      }
    >
      {open ? (
        <button
          type="button"
          className="nav-drawer__scrim disinab-admin__scrim"
          aria-label="بستن منو"
          onClick={close}
        />
      ) : null}
      <aside
        ref={panelRef}
        id="admin-menu"
        className="admin-shell__aside disinab-admin__aside"
        aria-label="منوی ادمین"
        role={narrow ? "dialog" : undefined}
        aria-modal={narrow ? open : undefined}
        tabIndex={narrow ? -1 : undefined}
        inert={narrow && !open ? true : undefined}
      >
        <div className="disinab-admin__aside-aura" aria-hidden="true" />
        <div className="disinab-admin__aside-plate">
          <div className="admin-shell__brand">
            <button
              type="button"
              className="nav-drawer__close admin-drawer__close"
              onClick={close}
            >
              بستن
            </button>
            <div className="admin-shell__brand-top">
              <Link href="/admin" className="admin-shell__brand-link">
                <span className="admin-shell__brand-mark" aria-hidden="true">
                  <DxCodeLogo decorative bare className="admin-shell__logo" />
                </span>
                <span className="admin-shell__brand-copy">
                  <DxCodeWordmark className="admin-shell__brand-kicker" />
                  <span className="admin-shell__brand-name">پنل مدیریت</span>
                  <span className="admin-shell__brand-tag">مرکز فرمان مالک</span>
                </span>
              </Link>
              <AdminLiveBadge refresh={false} />
            </div>
          </div>
          <nav className="admin-shell__nav" aria-label="منوی مدیریت">
            {ADMIN_MENU.map((group, groupIndex) => (
              <section
                key={group.label}
                className="admin-menu__group"
                style={{ "--menu-i": groupIndex } as CSSProperties}
              >
                <p className="admin-menu__label">{group.label}</p>
                <ul>
                  {group.items.map((item, itemIndex) => {
                    const current = isAdminNavCurrent(pathname, item);
                    const count = badges[item.href] ?? 0;
                    const label =
                      count > 0
                        ? `${item.label}، ${count.toLocaleString("fa-IR")} مورد نیازمند بررسی`
                        : item.label;
                    return (
                      <li
                        key={item.href}
                        style={
                          {
                            "--link-i": groupIndex * 4 + itemIndex,
                          } as CSSProperties
                        }
                      >
                        <Link
                          href={item.href}
                          className={
                            "admin-shell__link" +
                            (current ? " admin-shell__link--current" : "") +
                            (count > 0 ? " admin-shell__link--attention" : "")
                          }
                          aria-label={label}
                          aria-current={current ? "page" : undefined}
                          onClick={narrow ? close : undefined}
                        >
                          <span className="admin-shell__link-main">
                            <AdminNavIcon href={item.href} />
                            <span className="admin-shell__link-label">
                              {item.label}
                            </span>
                          </span>
                          <AdminNavPending />
                          {count > 0 ? (
                            <span className="admin-shell__count" aria-hidden="true">
                              {count.toLocaleString("fa-IR")}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>
          <div className="admin-shell__aside-foot">
            <div className="admin-shell__who">
              <span className="admin-shell__mark" aria-hidden="true">
                <DxCodeLogo
                  decorative
                  bare
                  className="admin-shell__admin-logo"
                  title="لوگوی ادمین DXCode"
                />
              </span>
              <div>
                <p className="admin-shell__user">{displayName}</p>
                <p className="admin-shell__role">
                  مالک <DxCodeWordmark className="dx-wordmark--inline" />
                </p>
              </div>
            </div>
            <Link href="/dashboard" className="admin-shell__muted-link">
              حساب دانشجو
            </Link>
            <Link href="/" className="admin-shell__muted-link">
              مشاهدهٔ سایت
            </Link>
          </div>
        </div>
      </aside>

      <div className="admin-shell__main disinab-admin__main">
        <header className="admin-shell__top disinab-admin__top">
          <div className="admin-shell__top-title">
            <button
              type="button"
              className="drawer-toggle admin-drawer-toggle"
              aria-expanded={open}
              aria-controls="admin-menu"
              onClick={toggle}
            >
              منو
            </button>
            <div className="admin-shell__top-copy">
              <DxCodeWordmark as="p" className="admin-shell__top-kicker" />
              <p className="admin-shell__top-heading">
                مدیریت <DxCodeWordmark className="dx-wordmark--inline" />
              </p>
            </div>
          </div>
          <div className="admin-shell__top-actions">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <div className="admin-shell__content disinab-admin__content">
          {children}
        </div>
      </div>
    </div>
  );
}
