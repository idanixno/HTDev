import { redirect } from "next/navigation";

/** Cart removed — purchase uses the per-course invoice preview. */
export default function CartPage() {
  redirect("/courses");
}
