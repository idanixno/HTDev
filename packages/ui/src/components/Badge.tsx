import type { HTMLAttributes, ReactNode } from "react";

/** Mirrors Figma Zharfa/Badge Status property. */
export type BadgeStatus = "success" | "pending" | "failure" | "information";

const DEFAULT_LABELS: Record<BadgeStatus, string> = {
  success: "تأییدشده",
  pending: "در انتظار",
  failure: "ناموفق",
  information: "اطلاع",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status?: BadgeStatus;
  children?: ReactNode;
};

export function Badge({
  status = "success",
  children,
  className,
  ...rest
}: BadgeProps) {
  const classes = ["z-badge", `z-badge--${status}`, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {children ?? DEFAULT_LABELS[status]}
    </span>
  );
}
