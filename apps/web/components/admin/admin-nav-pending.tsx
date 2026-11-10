"use client";

import { useLinkStatus } from "next/link";

export function AdminNavPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <span className="admin-shell__link-pending" aria-hidden="true" />;
}
