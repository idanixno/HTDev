import Link from "next/link";
import type { ReactNode } from "react";
import { DisinabPlate } from "./disinab";
import { ZharfaLogo } from "./zharfa-logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="disinab-auth">
      <DisinabPlate
        className="disinab-auth__plate"
        aria-labelledby="auth-heading"
      >
        <div className="disinab-auth__brand-row">
          <Link href="/" className="disinab-auth__mark" aria-label="ژرفا، صفحه اصلی">
            <ZharfaLogo className="disinab-auth__logo" decorative />
            <span>
              <strong>ژرفا</strong>
              <em>اطلس یادگیری عمیق</em>
            </span>
          </Link>
        </div>

        <h1 id="auth-heading">{title}</h1>
        <p className="disinab__line">{subtitle}</p>

        {children}

        {footer ? <div className="disinab-auth__footer">{footer}</div> : null}
      </DisinabPlate>
    </div>
  );
}
