import {
  DXCODE_MARK_BACKGROUND,
  DXCODE_MARK_COLORS,
  DXCODE_MARK_PATHS,
} from "./dxcode-mark-paths";

/** DXCode interlocking mark, matching the supplied blue-and-cyan artwork. */
export function DxCodeLogo({
  className = "",
  title = "DXCode",
  decorative = false,
  bare = false,
}: {
  className?: string;
  title?: string;
  decorative?: boolean;
  /** Draw only the mark when the surrounding brand container supplies the background. */
  bare?: boolean;
}) {
  return (
    <svg
      className={`dxcode-logo ${className}`.trim()}
      viewBox="0 0 64 64"
      width="64"
      height="64"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
    >
      {decorative ? null : <title>{title}</title>}
      {bare ? null : (
        <rect width="64" height="64" fill={DXCODE_MARK_BACKGROUND} />
      )}
      {DXCODE_MARK_PATHS.map((d, index) => (
        <path key={d} d={d} fill={DXCODE_MARK_COLORS[index]} />
      ))}
    </svg>
  );
}

/** Back-compat alias used across chrome. */
export function ZharfaLogo(props: Parameters<typeof DxCodeLogo>[0]) {
  return <DxCodeLogo {...props} title={props.title ?? "DXCode"} />;
}
