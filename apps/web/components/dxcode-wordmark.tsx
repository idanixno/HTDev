/**
 * DXCode brand wordmark — Orbitron display stack matching
 * VISUAL IDENTITY SYSTEM 01 (Knowledge Portal).
 * Use for brand name only; Persian UI stays on IRANSans.
 */

export function DxCodeWordmark({
  className = "",
  children = "DXCode",
  as: Tag = "span",
}: {
  className?: string;
  children?: string;
  as?: "span" | "strong" | "p" | "em";
}) {
  return (
    <Tag className={`dx-wordmark ${className}`.trim()} lang="en" dir="ltr">
      {children}
    </Tag>
  );
}
