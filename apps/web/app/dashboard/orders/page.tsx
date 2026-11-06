import Link from "next/link";
import { redirect } from "next/navigation";
import { Notice } from "@zharfa/ui";
import {
  fetchMyOrders,
  orderStatusLabel,
  providerLabel,
} from "../../../lib/commerce";
import { fetchCurrentUser } from "../../../lib/session";

export default async function OrdersPage() {
  const user = await fetchCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard/orders");
  }

  const orders = await fetchMyOrders();

  return (
    <section className="orders" aria-labelledby="orders-heading">
      <header className="orders__header">
        <p className="orders__eyebrow">حساب من</p>
        <h1 id="orders-heading" className="orders__title">
          تاریخچه سفارش‌ها
        </h1>
        <p className="orders__subtitle">
          وضعیت‌ها از سرور خوانده می‌شوند — بازگشت مرورگر به‌تنهایی کافی نیست.
        </p>
      </header>

      {orders.length === 0 ? (
        <Notice tone="information" title="سفارشی نیست">
          هنوز سفارشی ثبت نکرده‌اید. از{" "}
          <Link href="/courses">کاتالوگ</Link> یک دوره پولی انتخاب کنید.
        </Notice>
      ) : (
        <ul className="orders__list">
          {orders.map((order) => (
            <li key={order.id} className="orders__item">
              <div className="orders__item-main">
                <h2>
                  <Link href={order.course.href}>{order.course.title}</Link>
                </h2>
                <p>
                  {order.amountLabel}
                  {order.couponCode ? ` · کد ${order.couponCode}` : ""}
                </p>
                <p className="orders__meta">
                  {orderStatusLabel(order.status)} ·{" "}
                  {providerLabel(order.paymentProvider)} ·{" "}
                  {new Date(order.createdAt).toLocaleString("fa-IR")}
                </p>
              </div>
              <div className="orders__item-actions">
                {order.status === "PAID" ? (
                  <Link href={`/payments/success?orderId=${order.id}`}>
                    جزئیات
                  </Link>
                ) : order.status === "FAILED" ||
                  order.status === "CANCELED" ? (
                  <Link href={`/payments/failure?orderId=${order.id}`}>
                    جزئیات
                  </Link>
                ) : (
                  <Link href={`/payments/pending?orderId=${order.id}`}>
                    جزئیات
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="orders__back">
        <Link href="/dashboard">← بازگشت به حساب من</Link>
      </p>
    </section>
  );
}
