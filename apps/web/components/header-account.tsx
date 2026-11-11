"use client";

import Link from "next/link";

function AccountIcon({ authed }: { authed: boolean }) {
  if (authed) {
    return (
      <svg
        className="disinab-header__account-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.5 19.2c1.6-3.1 4-4.7 6.5-4.7s4.9 1.6 6.5 4.7" />
      </svg>
    );
  }

  return (
    <svg
      className="disinab-header__account-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 7.5h4.2V11.7" />
      <path d="M18.7 7.5 12.2 14" />
      <path d="M10.2 6.4H8.4A3.4 3.4 0 0 0 5 9.8v5.8A3.4 3.4 0 0 0 8.4 19h5.8a3.4 3.4 0 0 0 3.4-3.4v-1.7" />
    </svg>
  );
}

export function HeaderAccount({
  guestHref,
  guestLabel,
  authedHref,
  authedLabel,
  authed = false,
}: {
  guestHref: string;
  guestLabel: string;
  authedHref: string;
  authedLabel: string;
  /** Server-known session — avoids wrong guest icon while logged in. */
  authed?: boolean;
}) {
  const href = authed ? authedHref : guestHref;
  const label = authed ? authedLabel : guestLabel;

  return (
    <Link
      href={href}
      className="disinab-header__account"
      aria-label={label}
      title={label}
    >
      <AccountIcon authed={authed} />
    </Link>
  );
}
