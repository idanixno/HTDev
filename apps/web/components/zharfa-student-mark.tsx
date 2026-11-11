/** مهر دانشجوی DXCode — interlocking seal for the presence plate. */

export function ZharfaStudentMark({
  className = "",
  title = "مهر دانشجوی DXCode",
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
        <linearGradient id={`${uid}-cyan`} x1="12%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="var(--dx-cyan, #29d8ff)" />
          <stop offset="100%" stopColor="var(--dx-blue, #276bff)" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${uid}-violet`} x1="88%" y1="8%" x2="12%" y2="96%">
          <stop offset="0%" stopColor="var(--dx-violet, #7657f6)" />
          <stop offset="100%" stopColor="var(--dx-blue, #276bff)" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${uid}-ring`} x1="18%" y1="8%" x2="86%" y2="92%">
          <stop offset="0%" stopColor="var(--dx-blue, #276bff)" stopOpacity="0.95" />
          <stop offset="55%" stopColor="var(--dx-cyan, #29d8ff)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--dx-violet, #7657f6)" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <circle
        cx="36"
        cy="36"
        r="31"
        fill="none"
        stroke={`url(#${uid}-ring)`}
        strokeWidth="1.4"
        opacity="0.9"
      />
      <circle
        cx="36"
        cy="36"
        r="26.5"
        fill="none"
        stroke="var(--zharfa-text-primary)"
        strokeOpacity="0.16"
        strokeWidth="1"
        strokeDasharray="2.2 3.4"
      />

      <g fillRule="evenodd">
        <path
          fill={`url(#${uid}-cyan)`}
          d="M22.2 20.5c1-1.2 2.8-1.5 4.1-.6l14.2 9.4c1.4.9 1.8 2.7.8 4L33.2 45.2c-1 1.3-2.9 1.6-4.2.6L18.6 37.6c-1.3-.9-1.6-2.8-.5-4.1l4.1-13zm2.6 3-2.7 10.4 7.8 5.6 7.4-10.1-12.5-5.9z"
          opacity="0.96"
        />
        <path
          fill={`url(#${uid}-violet)`}
          d="M45.2 21.2c1.3-1 3.2-.7 4.2.6l4 14.8c.8 1.4.3 3.1-1 4L38.8 50.4c-1.3.9-3.1.5-4-.8L24.4 39.2c-.9-1.3-.5-3.1.8-4l20-14zm-1.9 4.4-13.4 10.5 7.2 8.6 10.5-6.8-4.3-12.3z"
          opacity="0.94"
        />
        <path
          fill="var(--zharfa-text-primary)"
          fillOpacity="0.16"
          d="M31.4 32.6 38.4 37.6 34 43.4 26.8 38.2z"
        />
      </g>

      <path
        d="M26.5 54.5h19"
        fill="none"
        stroke="var(--zharfa-text-primary)"
        strokeOpacity="0.28"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="28.5" cy="54.5" r="1.35" fill={`url(#${uid}-cyan)`} />
      <circle cx="36" cy="54.5" r="1.35" fill={`url(#${uid}-violet)`} opacity="0.85" />
      <circle cx="43.5" cy="54.5" r="1.35" fill={`url(#${uid}-cyan)`} opacity="0.55" />
    </svg>
  );
}
