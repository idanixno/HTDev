"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@zharfa/ui";
import type { CartCourseItem } from "../lib/catalog";
import {
  addCourseToCart,
  getCartServerSnapshot,
  getCartSnapshot,
  subscribeCart,
} from "../lib/cart-store";

export function AddToCartButton({ item }: { item: CartCourseItem }) {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const saved = items.some((entry) => entry.id === item.id);

  if (saved) {
    return (
      <Button href="/cart" variant="secondary">
        اضافه شد؛ برو به سبد خرید
      </Button>
    );
  }

  return (
    <Button type="button" onClick={() => addCourseToCart(item)}>
      افزودن به سبد
    </Button>
  );
}
