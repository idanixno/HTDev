import type { ReactNode } from "react";
import { DisinabPlate } from "./disinab";

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
        <h1 id="auth-heading">{title}</h1>
        <p className="disinab__line">{subtitle}</p>

        {children}

        {footer ? <div className="disinab-auth__footer">{footer}</div> : null}
      </DisinabPlate>
    </div>
  );
}
