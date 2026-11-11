import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Single public chrome — same header/footer as the home page. */
export async function SiteChrome({
  children,
  footer = true,
  className,
}: {
  children: ReactNode;
  footer?: boolean;
  className?: string;
}) {
  return (
    <div className={["shell", className].filter(Boolean).join(" ")}>
      <SiteHeader />
      <main className="shell__main">{children}</main>
      {footer ? <SiteFooter /> : null}
    </div>
  );
}
