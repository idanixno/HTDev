"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useMenuDrawer } from "./use-menu-drawer";

export function AccountMenuFrame({ children }: { children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { open, narrow, close, toggle } = useMenuDrawer("(max-width: 980px)");

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <div className={"account-menu-frame" + (open ? " is-open" : "")}>
      <button
        type="button"
        className="drawer-toggle account-drawer-toggle"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={toggle}
      >
        منوی حساب
      </button>
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
      <div
        ref={panelRef}
        id="account-menu"
        className="account-drawer-slot"
        role={narrow ? "dialog" : undefined}
        aria-modal={narrow ? open : undefined}
        aria-label={narrow ? "منوی حساب" : undefined}
        tabIndex={narrow ? -1 : undefined}
        inert={narrow && !open ? true : undefined}
      >
        <button type="button" className="nav-drawer__close account-drawer__close" onClick={close}>
          بستن
        </button>
        {children}
      </div>
    </div>
  );
}
