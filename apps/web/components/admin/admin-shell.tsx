"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "../theme-toggle";
import { LogoutButton } from "../logout-button";
import { useMenuDrawer } from "../use-menu-drawer";
import { AdminLiveBadge } from "./live-badge";
import { ADMIN_MENU, isAdminNavCurrent } from "./admin-nav";

function markOf(name: string) {
  const part = name.trim().split(/\s+/).filter(Boolean)[0] ?? "ژ";
  return part.slice(0, 1);
}

export function AdminShell({
  displayName,
  children,
}: {
  displayName: string;
  children: ReactNode;
}) {
  const pathname = usePathname() || "/admin";
  const panelRef = useRef<HTMLElement>(null);
  const { open, narrow, close, toggle } = useMenuDrawer("(max-width: 900px)");

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <div className={"admin-shell" + (open ? " is-menu-open" : "")}>
      {open
        ? createPortal(
            <button
              type="button"
              className="nav-drawer__scrim"
              aria-label="بستن منو"
              onClick={close}
            />,
            document.body,
          )
        : null}
      <aside
        ref={panelRef}
        id="admin-menu"
        className="admin-shell__aside"
        aria-label="منوی ادمین"
        role={narrow ? "dialog" : undefined}
        aria-modal={narrow ? open : undefined}
        tabIndex={narrow ? -1 : undefined}
        inert={narrow && !open ? true : undefined}
      >
        <div className="admin-shell__brand">
          <button type="button" className="nav-drawer__close admin-drawer__close" onClick={close}>
            بستن
          </button>
          <div className="admin-shell__brand-top">
            <Link href="/admin" className="admin-shell__brand-link">
              <span className="admin-shell__brand-name">ژرفا</span>
              <span className="admin-shell__brand-tag">پنل مدیریت</span>
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
                          (current ? " admin-shell__link--current" : "")
                        }
                        aria-current={current ? "page" : undefined}
                        onClick={narrow ? close : undefined}
                      >
                        {item.label}
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
              {markOf(displayName)}
            </span>
            <div>
              <p className="admin-shell__user">{displayName}</p>
              <p className="admin-shell__role">مالک ژرفا</p>
            </div>
          </div>
          <Link href="/dashboard" className="admin-shell__muted-link">
            حساب دانشجو
          </Link>
          <Link href="/" className="admin-shell__muted-link">
            مشاهدهٔ سایت
          </Link>
        </div>
      </aside>

      <div className="admin-shell__main">
        <header className="admin-shell__top">
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
            <p>مدیریت ژرفا</p>
          </div>
          <div className="admin-shell__top-actions">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <div className="admin-shell__content">{children}</div>
      </div>
    </div>
  );
}
