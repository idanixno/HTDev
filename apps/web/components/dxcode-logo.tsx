import { useId } from "react";

/**
 * DXCode portal mark — hexagonal Knowledge Portal with cyan chevron.
 * Geometry is centered on the 64×64 viewBox (32, 32).
 */

const CX = 32;
const CY = 32;

/** Pointy-top regular hex path, vertical left/right sides. */
function hexPath(radius: number): string {
  const r = (n: number) => Math.round(n * 100) / 100;
  const halfW = (radius * Math.sqrt(3)) / 2;
  const halfH = radius / 2;
  const top = r(CY - radius);
  const bot = r(CY + radius);
  const right = r(CX + halfW);
  const left = r(CX - halfW);
  const upper = r(CY - halfH);
  const side = r(radius);
  return `M${CX} ${top} ${right} ${upper}v${side}L${CX} ${bot} ${left} ${r(CY + halfH)}V${upper}Z`;
}

export function DxCodeLogo({
  className = "",
  title = "DXCode",
  decorative = false,
  bare = false,
}: {
  className?: string;
  title?: string;
  decorative?: boolean;
  /** Hex + chevron only — no light plate (for dark nests). */
  bare?: boolean;
}) {
  const uid = useId().replace(/:/g, "");

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
      <defs>
        <linearGradient id={`${uid}-metal`} x1="18%" y1="6%" x2="86%" y2="94%">
          <stop offset="0%" stopColor="#e8eef8" />
          <stop offset="35%" stopColor="#7a8aa3" />
          <stop offset="70%" stopColor="#3a4a66" />
          <stop offset="100%" stopColor="#152033" />
        </linearGradient>
        <linearGradient id={`${uid}-face`} x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#2a3b5c" />
          <stop offset="55%" stopColor="#121a2c" />
          <stop offset="100%" stopColor="#070b16" />
        </linearGradient>
        <linearGradient id={`${uid}-cyan`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--dx-cyan, #29d8ff)" />
          <stop offset="100%" stopColor="var(--dx-blue, #276bff)" />
        </linearGradient>
        {bare ? null : (
          <linearGradient id={`${uid}-plate`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="var(--zharfa-surface-raised)" />
            <stop offset="100%" stopColor="var(--zharfa-bg-canvas)" />
          </linearGradient>
        )}
      </defs>

      {bare ? null : (
        <>
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="16"
            fill={`url(#${uid}-plate)`}
          />
          <rect
            x="2.75"
            y="2.75"
            width="58.5"
            height="58.5"
            rx="15.25"
            fill="none"
            stroke="color-mix(in srgb, var(--dx-cyan, #29d8ff) 40%, var(--zharfa-border-default))"
            strokeWidth="1.2"
          />
        </>
      )}

      {/* Outer hex — radius 16, inset from plate */}
      <path
        d={hexPath(16)}
        fill={`url(#${uid}-metal)`}
        opacity="0.92"
      />
      {/* Inner face */}
      <path d={hexPath(12.2)} fill={`url(#${uid}-face)`} />
      {/* Inner hex ring */}
      <path
        d={hexPath(9.6)}
        fill="none"
        stroke={`url(#${uid}-cyan)`}
        strokeWidth="1.35"
        opacity="0.85"
      />
      {/* Portal chevron > — bbox centered on (32, 32) */}
      <path
        d="M28 25.2 36 32 28 38.8"
        fill="none"
        stroke={`url(#${uid}-cyan)`}
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Back-compat alias used across chrome. */
export function ZharfaLogo(props: Parameters<typeof DxCodeLogo>[0]) {
  return <DxCodeLogo {...props} title={props.title ?? "DXCode"} />;
}
