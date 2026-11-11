import { Fragment, type ReactNode } from "react";
import { DxCodeWordmark } from "./dxcode-wordmark";

/** Renders a string and wraps every `DXCode` with the brand wordmark font. */
export function BrandText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}): ReactNode {
  const parts = children.split(/(DXCode)/g);
  if (parts.length === 1) return children;

  return (
    <span className={className || undefined}>
      {parts.map((part, index) =>
        part === "DXCode" ? (
          <DxCodeWordmark
            key={`dx-${index}`}
            className="dx-wordmark--inline"
          />
        ) : (
          <Fragment key={`t-${index}`}>{part}</Fragment>
        ),
      )}
    </span>
  );
}
