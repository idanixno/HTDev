import { redirect } from "next/navigation";

/** Orders live on overview / payment result pages — keep URL as soft redirect. */
export default function OrdersPage() {
  redirect("/dashboard");
}
