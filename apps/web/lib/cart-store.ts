"use client";

import type { CartCourseItem } from "./catalog";
import { parseTomanLabel } from "./catalog";

const KEY = "zharfa-cart";
const EMPTY: CartCourseItem[] = [];

let snapshot: CartCourseItem[] = EMPTY;
const listeners = new Set<() => void>();

function isItem(value: unknown): value is CartCourseItem {
  if (!value || typeof value !== "object") return false;
  const item = value as CartCourseItem;
  return (
    typeof item.id === "string" &&
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.href === "string" &&
    typeof item.priceLabel === "string"
  );
}

function normalizeItem(item: CartCourseItem): CartCourseItem {
  const priceToman =
    typeof item.priceToman === "number" && Number.isFinite(item.priceToman)
      ? item.priceToman
      : parseTomanLabel(item.priceLabel);
  const compareAtToman =
    typeof item.compareAtToman === "number" && Number.isFinite(item.compareAtToman)
      ? item.compareAtToman
      : item.compareAtLabel
        ? parseTomanLabel(item.compareAtLabel)
        : null;
  return {
    ...item,
    coverAsset: item.coverAsset ?? null,
    priceToman,
    compareAtToman:
      compareAtToman != null && compareAtToman > priceToman ? compareAtToman : null,
    compareAtLabel: item.compareAtLabel ?? null,
    discountLabel: item.discountLabel ?? null,
  };
}

function read(): CartCourseItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(isItem).map(normalizeItem);
  } catch {
    return EMPTY;
  }
}

function persist(next: CartCourseItem[]) {
  snapshot = next.map(normalizeItem);
  window.localStorage.setItem(KEY, JSON.stringify(snapshot));
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  snapshot = read();
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCartSnapshot() {
  return snapshot;
}

export function getCartServerSnapshot() {
  return EMPTY;
}

export function addCourseToCart(item: CartCourseItem) {
  if (snapshot.some((entry) => entry.id === item.id)) return;
  persist([...snapshot, normalizeItem(item)]);
}

export function removeCourseFromCart(id: string) {
  persist(snapshot.filter((entry) => entry.id !== id));
}

export function clearCart() {
  persist([]);
}
