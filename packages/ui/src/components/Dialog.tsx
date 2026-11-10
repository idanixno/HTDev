"use client";

import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

export type DialogProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  open: boolean;
  title: ReactNode;
  children: ReactNode;
  indexLabel?: ReactNode | null;
  footnote?: ReactNode | null;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  confirmDanger?: boolean;
};

export function Dialog({
  open,
  title,
  children,
  indexLabel = null,
  footnote = null,
  cancelLabel = "لغو",
  confirmLabel = "تأیید",
  onCancel,
  onConfirm,
  confirmDanger = false,
  className,
  ...rest
}: DialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const focusable = node?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onCancel]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const classes = ["z-dialog", className ?? ""].filter(Boolean).join(" ");

  return createPortal(
    <div
      className="z-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        {...rest}
      >
        <div className="z-dialog__header">
          <h2 className="z-dialog__title" id={titleId}>
            {title}
          </h2>
          {indexLabel ? <p className="z-dialog__index">{indexLabel}</p> : null}
        </div>
        <div className="z-dialog__body">{children}</div>
        <div className="z-dialog__actions">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          {onConfirm ? (
            <Button
              variant={confirmDanger ? "danger" : "primary"}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          ) : null}
        </div>
        {footnote ? <p className="z-dialog__footnote">{footnote}</p> : null}
      </div>
    </div>,
    document.body,
  );
}
