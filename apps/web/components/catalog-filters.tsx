"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMenuDrawer } from "./use-menu-drawer";

export function CatalogFilters({
  active,
  children,
}: {
  active: number;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { open, narrow, close, toggle } = useMenuDrawer("(max-width: 900px)");

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  const label =
    active > 0
      ? `فیلتر و ترتیب (${active.toLocaleString("fa-IR")})`
      : "فیلتر و ترتیب";

  return (
    <div className={"catalog-filters" + (open ? " is-open" : "")}>
      <button
        type="button"
        className="drawer-toggle catalog-filters__toggle"
        aria-expanded={open}
        aria-controls="catalog-filter-panel"
        onClick={toggle}
      >
        {label}
      </button>
      {open
        ? createPortal(
            <button
              type="button"
              className="nav-drawer__scrim"
              aria-label="بستن فیلترها"
              onClick={close}
            />,
            document.body,
          )
        : null}
      <div
        ref={panelRef}
        id="catalog-filter-panel"
        className="catalog-filters__panel"
        role={narrow ? "dialog" : undefined}
        aria-modal={narrow ? open : undefined}
        aria-label="فیلتر دوره‌ها"
        tabIndex={narrow ? -1 : undefined}
        inert={narrow && !open ? true : undefined}
      >
        <div className="catalog-filters__bar">
          <div className="catalog-filters__heading">
            <p className="catalog-filters__title">فیلتر دوره‌ها</p>
            {active > 0 ? (
              <p className="catalog-filters__meta">
                {active.toLocaleString("fa-IR")} فیلتر فعال
              </p>
            ) : (
              <p className="catalog-filters__meta">قلمرو و وضعیت انتشار</p>
            )}
          </div>
          <button
            type="button"
            className="nav-drawer__close catalog-filters__close"
            onClick={close}
          >
            بستن
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
