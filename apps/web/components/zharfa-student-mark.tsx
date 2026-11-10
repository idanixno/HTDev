/** مهر ویژهٔ دانشجوی ژرفا — depth seal for the presence plate. */

export function ZharfaStudentMark({
  className = "",
  title = "مهر دانشجوی ژرفا",
}: {
  className?: string;
  title?: string;
}) {
  const uid = "zsm";
  return (
    <svg
      className={`zharfa-student-mark ${className}`.trim()}
      viewBox="0 0 72 72"
      width="72"
      height="72"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={`${uid}-glow`} x1="18%" y1="8%" x2="86%" y2="92%">
          <stop offset="0%" stopColor="var(--zharfa-action-primary)" stopOpacity="0.95" />
          <stop offset="55%" stopColor="var(--zharfa-text-link)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--zharfa-action-primary)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`${uid}-ink`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--zharfa-text-primary)" stopOpacity="0.98" />
          <stop offset="100%" stopColor="var(--zharfa-text-primary)" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      {/* Outer seal ring */}
      <circle
        cx="36"
        cy="36"
        r="31"
        fill="none"
        stroke={`url(#${uid}-glow)`}
        strokeWidth="1.4"
        opacity="0.9"
      />
      <circle
        cx="36"
        cy="36"
        r="26.5"
        fill="none"
        stroke="var(--zharfa-text-primary)"
        strokeOpacity="0.18"
        strokeWidth="1"
        strokeDasharray="2.2 3.4"
      />

      {/* Depth / atlas arcs — ژرفا */}
      <path
        d="M18 40c4.5-11 12.5-17.5 18-17.5S49.5 29 54 40"
        fill="none"
        stroke={`url(#${uid}-glow)`}
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M21.5 43.5c3.6-8.4 9.8-13.2 14.5-13.2s10.9 4.8 14.5 13.2"
        fill="none"
        stroke="var(--zharfa-text-primary)"
        strokeOpacity="0.35"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M25 46.5c2.7-5.8 7.1-9 11-9s8.3 3.2 11 9"
        fill="none"
        stroke={`url(#${uid}-glow)`}
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Core gem / depth point */}
      <circle cx="36" cy="40.5" r="3.2" fill={`url(#${uid}-glow)`} />
      <circle
        cx="36"
        cy="40.5"
        r="1.35"
        fill="var(--zharfa-text-primary)"
        fillOpacity="0.92"
      />

      {/* Student badge notch */}
      <path
        d="M36 14.5l2.1 4.1 4.5.5-3.4 3.1.9 4.4L36 24.4l-3.9 2.2.9-4.4-3.4-3.1 4.5-.5Z"
        fill={`url(#${uid}-ink)`}
        opacity="0.88"
      />

      {/* Tiny path mark under — learner track */}
      <path
        d="M28.5 52.5h15"
        fill="none"
        stroke="var(--zharfa-text-primary)"
        strokeOpacity="0.28"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="30" cy="52.5" r="1.35" fill={`url(#${uid}-glow)`} />
      <circle cx="36" cy="52.5" r="1.35" fill={`url(#${uid}-glow)`} opacity="0.75" />
      <circle cx="42" cy="52.5" r="1.35" fill={`url(#${uid}-glow)`} opacity="0.5" />
    </svg>
  );
}
