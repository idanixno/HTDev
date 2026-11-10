import type { Metadata } from "next";
import { CartView } from "../../components/cart-view";
import { privateMetadata } from "../../lib/seo";

export const metadata: Metadata = privateMetadata("سبد خرید");

export default function CartPage() {
  return <CartView />;
}
