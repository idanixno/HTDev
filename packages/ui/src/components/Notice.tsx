import type { HTMLAttributes, ReactNode } from "react";

export type NoticeTone = "success" | "information" | "warning" | "error";

export type NoticeProps = HTMLAttributes<HTMLDivElement> & {
  tone?: NoticeTone;
  title: ReactNode;
  children: ReactNode;
};

export function Notice({
  tone = "success",
  title,
  children,
  className,
  role = "status",
  ...rest
}: NoticeProps) {
  const classes = ["z-notice", `z-notice--${tone}`, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role={role} {...rest}>
      <div className="z-notice__body">
        <p className="z-notice__title">{title}</p>
        <p className="z-notice__message">{children}</p>
      </div>
      <div className="z-notice__accent" aria-hidden="true" />
    </div>
  );
}
