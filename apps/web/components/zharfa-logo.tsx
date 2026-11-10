import { useId } from "react";

/**
 * لوگوی اختصاصی ژرفا — Depth Atlas Seal
 * Bathymetric aperture + sounding line + three depth nodes (ژ signature).
 * Theme-aware via --zharfa-* tokens; path-only (no font).
 */

export function ZharfaLogo({
  className = "",
  title = "ژرفا",
  decorative = false,
}: {
  className?: string;
  title?: string;
  decorative?: boolean;
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      className={`zharfa-logo ${className}`.trim()}
      viewBox="0 0 64 64"
      width="64"
      height="64"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
    >
      {decorative ? null : <title>{title}</title>}
      <defs>
        <linearGradient id={`${uid}-plate`} x1="16%" y1="6%" x2="88%" y2="96%">
          <stop
            offset="0%"
            stopColor="var(--zharfa-surface-raised)"
          />
          <stop
            offset="55%"
            stopColor="var(--zharfa-surface-card)"
          />
          <stop
            offset="100%"
            stopColor="var(--zharfa-bg-canvas)"
          />
        </linearGradient>
        <linearGradient id={`${uid}-rim`} x1="8%" y1="0%" x2="92%" y2="100%">
          <stop
            offset="0%"
            stopColor="var(--zharfa-text-link)"
            stopOpacity="0.95"
          />
          <stop
            offset="45%"
            stopColor="var(--zharfa-action-primary)"
            stopOpacity="1"
          />
          <stop
            offset="100%"
            stopColor="var(--zharfa-action-active)"
            stopOpacity="0.7"
          />
        </linearGradient>
        <linearGradient id={`${uid}-beam`} x1="50%" y1="8%" x2="50%" y2="78%">
          <stop
            offset="0%"
            stopColor="var(--zharfa-text-link)"
            stopOpacity="0.15"
          />
          <stop
            offset="55%"
            stopColor="var(--zharfa-action-primary)"
            stopOpacity="0.55"
          />
          <stop
            offset="100%"
            stopColor="var(--zharfa-action-primary)"
            stopOpacity="0.05"
          />
        </linearGradient>
        <radialGradient id={`${uid}-core`} cx="50%" cy="48%" r="42%">
          <stop
            offset="0%"
            stopColor="var(--zharfa-action-primary)"
            stopOpacity="0.45"
          />
          <stop
            offset="40%"
            stopColor="var(--zharfa-action-primary)"
            stopOpacity="0.14"
          />
          <stop
            offset="100%"
            stopColor="var(--zharfa-action-primary)"
            stopOpacity="0"
          />
        </radialGradient>
        <linearGradient id={`${uid}-ink`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="var(--zharfa-text-primary)" />
          <stop
            offset="100%"
            stopColor="var(--zharfa-text-link)"
            stopOpacity="0.92"
          />
        </linearGradient>
      </defs>

      {/* Outer seal */}
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="18"
        fill={`url(#${uid}-plate)`}
      />
      <rect
        x="3.7"
        y="3.7"
        width="56.6"
        height="56.6"
        rx="17.3"
        fill="none"
        stroke={`url(#${uid}-rim)`}
        strokeWidth="1.4"
      />
      <rect
        x="6.5"
        y="6.5"
        width="51"
        height="51"
        rx="14.5"
        fill="none"
        stroke="var(--zharfa-text-primary)"
        strokeOpacity="0.08"
        strokeWidth="1"
      />

      {/* Soft depth well */}
      <circle cx="32" cy="30" r="18" fill={`url(#${uid}-core)`} />

      {/* Sounding beam */}
      <path
        d="M32 11.5v28.5"
        stroke={`url(#${uid}-beam)`}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M32 12v27"
        fill="none"
        stroke={`url(#${uid}-rim)`}
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Bathymetric contours — depth atlas */}
      <g
        fill="none"
        stroke={`url(#${uid}-rim)`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M15.5 34.5c4.2-11.8 11.6-18 16.5-18s12.3 6.2 16.5 18"
          strokeWidth="1.55"
          opacity="0.95"
        />
        <path
          d="M18.8 36.8c3.4-8.8 9.2-13.3 13.2-13.3s9.8 4.5 13.2 13.3"
          stroke="var(--zharfa-text-primary)"
          strokeOpacity="0.28"
          strokeWidth="1.2"
        />
        <path
          d="M22.2 38.8c2.5-6 6.7-9 9.8-9s7.3 3 9.8 9"
          strokeWidth="1.35"
          opacity="0.8"
        />
        <path
          d="M25.4 40.5c1.7-3.8 4.5-5.7 6.6-5.7s4.9 1.9 6.6 5.7"
          stroke="var(--zharfa-text-primary)"
          strokeOpacity="0.22"
          strokeWidth="1.1"
        />
      </g>

      {/* Focal core — deepest point */}
      <circle cx="32" cy="41.2" r="3.15" fill={`url(#${uid}-rim)`} />
      <circle
        cx="32"
        cy="41.2"
        r="1.35"
        fill="var(--zharfa-text-primary)"
        fillOpacity="0.95"
      />

      {/* ژ signature — three atlas nodes on a reading rail */}
      <path
        d="M21.5 50.2h21"
        fill="none"
        stroke="var(--zharfa-text-primary)"
        strokeOpacity="0.2"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="50.2" r="2.05" fill={`url(#${uid}-rim)`} />
      <circle
        cx="32"
        cy="50.2"
        r="2.05"
        fill={`url(#${uid}-rim)`}
        opacity="0.82"
      />
      <circle
        cx="39.5"
        cy="50.2"
        r="2.05"
        fill={`url(#${uid}-rim)`}
        opacity="0.62"
      />
      <circle
        cx="24.5"
        cy="50.2"
        r="0.75"
        fill="var(--zharfa-text-primary)"
        fillOpacity="0.95"
      />
      <circle
        cx="32"
        cy="50.2"
        r="0.75"
        fill="var(--zharfa-text-primary)"
        fillOpacity="0.8"
      />
      <circle
        cx="39.5"
        cy="50.2"
        r="0.75"
        fill="var(--zharfa-text-primary)"
        fillOpacity="0.6"
      />

      {/* Zenith instrument tick */}
      <path
        d="M29.2 12.2h5.6"
        fill="none"
        stroke={`url(#${uid}-ink)`}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
