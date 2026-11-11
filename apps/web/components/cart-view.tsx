"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useSyncExternalStore } from "react";
import { Button } from "@zharfa/ui";
import { DisinabBadge, DisinabPlate } from "./disinab";
import { summarizeCart } from "../lib/catalog";
import {
  getCartServerSnapshot,
  getCartSnapshot,
  removeCourseFromCart,
  subscribeCart,
} from "../lib/cart-store";

export function CartView() {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );
  const summary = summarizeCart(items);

  return (
    <section
      className="cart-page cart-page--live disinab-cart"
      aria-labelledby="cart-heading"
    >
      <DisinabPlate className="disinab-cart__mast" aria-labelledby="cart-heading">
        <header className="disinab-cart__head">
          <div>
            <h1 id="cart-heading">سبد خرید</h1>
            <p className="disinab__line">
              هر دوره جدا پرداخت می‌شود؛ مبلغ نهایی هنگام تسویه روی سرور حساب
              می‌شود.
            </p>
          </div>
          {summary.count > 0 ? (
            <DisinabBadge tone="accent">
              {summary.count.toLocaleString("fa-IR")} دوره
            </DisinabBadge>
          ) : null}
        </header>
      </DisinabPlate>

      {items.length === 0 ? (
        <DisinabPlate className="disinab-cart__empty" aura={false}>
          <p className="cart-empty__title">سبد خرید خالی است</p>
          <p className="disinab__line">
            دوره‌ای اضافه نشده. از کاتالوگ یک دوره انتخاب کنید و به سبد بیفزایید.
          </p>
          <Button href="/courses">مشاهده دوره‌ها</Button>
        </DisinabPlate>
      ) : (
        <div className="cart-split disinab-cart__split">
          <DisinabPlate
            className="disinab-cart__main"
            aura={false}
            aria-labelledby="cart-items-heading"
          >
            <header className="disinab-cart__section-head">
              <h2 id="cart-items-heading">دوره‌های سبد</h2>
            </header>
            <ul className="cart-lines disinab-cart__lines">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="cart-line disinab-cart__line"
                  style={{ "--line-i": index } as CSSProperties}
                >
                  <span className="cart-line__index" aria-hidden="true">
                    {(index + 1).toLocaleString("fa-IR")}
                  </span>
                  <Link href={item.href} className="cart-line__media">
                    {item.coverAsset ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.coverAsset} alt="" />
                    ) : (
                      <span className="dx-wordmark dx-wordmark--inline">DXCode</span>
                    )}
                  </Link>
                  <div className="cart-line__body">
                    <h3>
                      <Link href={item.href}>{item.title}</Link>
                    </h3>
                    <p className="cart-line__price">
                      <strong>{item.priceLabel}</strong>
                      {item.compareAtLabel ? <s>{item.compareAtLabel}</s> : null}
                      {item.discountLabel ? <em>{item.discountLabel}</em> : null}
                    </p>
                  </div>
                  <div className="cart-line__actions">
                    <Button href={`/courses/${item.slug}/purchase`}>
                      پرداخت
                    </Button>
                    <button
                      type="button"
                      className="cart-line__remove"
                      onClick={() => removeCourseFromCart(item.id)}
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </DisinabPlate>

          <DisinabPlate
            className="disinab-cart__invoice"
            as="aside"
            aria-labelledby="cart-invoice-heading"
          >
            <header className="disinab-cart__section-head">
              <h2 id="cart-invoice-heading">فاکتور سبد</h2>
            </header>

            <ul className="cart-invoice__rows disinab-cart__invoice-rows">
              {items.map((item) => (
                <li key={item.id}>
                  <span>{item.title}</span>
                  <strong>{item.priceLabel}</strong>
                </li>
              ))}
            </ul>

            <dl className="cart-invoice__totals disinab-cart__totals">
              <div>
                <dt>جمع قبل از تخفیف</dt>
                <dd>{summary.compareLabel}</dd>
              </div>
              {summary.savings > 0 ? (
                <div className="cart-invoice__savings">
                  <dt>تخفیف دوره‌ها</dt>
                  <dd>−{summary.savingsLabel}</dd>
                </div>
              ) : null}
              <div className="cart-invoice__grand">
                <dt>جمع کل برآوردی</dt>
                <dd>{summary.payableLabel}</dd>
              </div>
            </dl>
          </DisinabPlate>
        </div>
      )}
    </section>
  );
}
