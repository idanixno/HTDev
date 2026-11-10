"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getCartServerSnapshot,
  getCartSnapshot,
  subscribeCart,
} from "../lib/cart-store";

function CartIcon() {
  return (
    <svg
      className="cart-link__icon"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 5h1.6l1.4 10.2a1.5 1.5 0 0 0 1.5 1.3h8.7a1.5 1.5 0 0 0 1.5-1.2L19.5 8H7" />
      <circle cx="10" cy="19.2" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.2" cy="19.2" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CartLink() {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const count = items.length;
  const label =
    count > 0
      ? `سبد خرید، ${count.toLocaleString("fa-IR")} مورد`
      : "سبد خرید";

  return (
    <Link href="/cart" className="cart-link" aria-label={label}>
      <CartIcon />
      {count > 0 ? (
        <span className="cart-link__count" aria-hidden="true">
          {count.toLocaleString("fa-IR")}
        </span>
      ) : null}
    </Link>
  );
}
