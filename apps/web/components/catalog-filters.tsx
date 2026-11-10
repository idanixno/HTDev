"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { DisinabBadge } from "./disinab";
import { useMenuDrawer } from "./use-menu-drawer";

export type CatalogFilterMenu = {
  id: string;
  label: string;
  /** Short status under the drawer title */
  hint?: string;
  /** Highlight the toggle when this dimension is filtered */
  active?: boolean;
  /** Current selection shown on the desktop dropdown trigger */
  valueLabel?: string;
  children: ReactNode;
};

export function CatalogFilters({
  menus,
  search,
}: {
  menus: CatalogFilterMenu[];
  /** @deprecated kept for callers; desktop mast now owns search outside */
  search?: ReactNode;
}) {
  const baseId = useId();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const { narrow } = useMenuDrawer("(max-width: 900px)");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setOpenId(null);
  }, [pathname]);

  useEffect(() => {
    if (!narrow) setOpenId(null);
  }, [narrow]);

  useEffect(() => {
    if (openId) panelRef.current?.focus({ preventScroll: true });
  }, [openId]);

  useEffect(() => {
    if (!openId || !narrow) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [openId, narrow]);

  function close() {
    setOpenId(null);
  }

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  function onDesktopToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    const el = event.currentTarget;
    if (!el.open || !desktopRef.current) return;
    for (const other of desktopRef.current.querySelectorAll("details.catalog-dd")) {
      if (other !== el) (other as HTMLDetailsElement).open = false;
    }
  }

  const openMenu = menus.find((menu) => menu.id === openId) ?? null;
  const panelDomId = `${baseId}-panel`;

  const drawer =
    narrow && openMenu ? (
      <div
        ref={panelRef}
        id={panelDomId}
        className="catalog-filters__panel disinab-filter-drawer is-open"
        role="dialog"
        aria-modal="true"
        aria-label={openMenu.label}
        tabIndex={-1}
      >
        <div className="disinab-filter-drawer__aura" aria-hidden="true" />
        <div className="disinab-filter-drawer__inner">
          <div className="catalog-filters__bar disinab-filter-drawer__bar">
            <div className="catalog-filters__heading">
              <p className="disinab__brand">ژرفا · کاتالوگ</p>
              <div className="disinab-filter-drawer__title-row">
                <p className="catalog-filters__title">{openMenu.label}</p>
                {openMenu.active ? (
                  <DisinabBadge tone="accent">فعال</DisinabBadge>
                ) : (
                  <DisinabBadge tone="muted">همه</DisinabBadge>
                )}
              </div>
              <p className="catalog-filters__meta">
                {openMenu.hint ?? "انتخاب کنید"}
              </p>
            </div>
            <button
              type="button"
              className="disinab-filter-drawer__close catalog-filters__close"
              aria-label="بستن"
              onClick={close}
            >
              <svg
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
          </div>
          <div className="disinab-filter-drawer__body">{openMenu.children}</div>
        </div>
      </div>
    ) : null;

  const toggles = (
    <div className="catalog-filters__toggles" role="toolbar" aria-label="منوهای فیلتر">
      {menus.map((menu) => {
        const expanded = openId === menu.id;
        return (
          <button
            key={menu.id}
            type="button"
            className={
              "drawer-toggle catalog-filters__toggle" +
              (menu.active ? " is-active" : "")
            }
            aria-expanded={expanded}
            aria-controls={panelDomId}
            onClick={() => toggle(menu.id)}
          >
            {menu.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className={
        "catalog-filters disinab-catalog__filters-slot" +
        (openId ? " is-open" : "")
      }
    >
      {search ? (
        <div className="disinab-catalog__find-toolbar">
          {search}
          {toggles}
        </div>
      ) : (
        toggles
      )}

      {!narrow ? (
        <div
          ref={desktopRef}
          className="catalog-filters__desktop"
          aria-label="فیلتر دوره‌ها"
        >
          {menus.map((menu) => (
            <details
              key={menu.id}
              className={
                "catalog-dd" + (menu.active ? " catalog-dd--active" : "")
              }
              onToggle={onDesktopToggle}
            >
              <summary className="catalog-dd__trigger">
                <span className="catalog-dd__meta">
                  <span className="catalog-dd__label">{menu.label}</span>
                  <span className="catalog-dd__value">
                    {menu.valueLabel ?? (menu.active ? "انتخاب‌شده" : "همه")}
                  </span>
                </span>
                <span className="catalog-dd__chevron" aria-hidden="true" />
              </summary>
              <div className="catalog-dd__panel">{menu.children}</div>
            </details>
          ))}
        </div>
      ) : openMenu ? (
        createPortal(
          <>
            <button
              type="button"
              className="nav-drawer__scrim disinab-filter-drawer__scrim"
              aria-label="بستن فیلترها"
              onClick={close}
            />
            {drawer}
          </>,
          document.body,
        )
      ) : null}
    </div>
  );
}
