import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@zharfa/ui";
import { DisinabBadge, DisinabPlate } from "../../../components/disinab";
import { fetchFaq } from "../../../lib/catalog";
import { buildPageMetadata } from "../../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "پرسش‌های رایج",
  description: "پاسخ پرسش‌های منتشرشده درباره خرید، دسترسی و پشتیبانی ژرفا.",
  path: "/faq",
});

export default async function FaqPage() {
  const items = await fetchFaq();

  return (
    <div className="disinab-faq">
      <DisinabPlate
        className="disinab-faq__mast"
        aria-labelledby="faq-title"
      >
        <nav className="crumbs disinab-faq__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <span>پرسش‌های رایج</span>
        </nav>
        <div className="disinab-faq__intro">
          <div>
            <p className="disinab__brand">ژرفا · پشتیبانی</p>
            <h1 id="faq-title">پرسش‌های رایج</h1>
            <p className="disinab__line">
              این فهرست از محتوای منتشرشده مدیریت خوانده می‌شود. اگر پاسخ این‌جا
              نیست، بعد از ورود تیکت بسازید.
            </p>
          </div>
          <DisinabBadge tone="accent">
            {items.length.toLocaleString("fa-IR")} پرسش
          </DisinabBadge>
        </div>
        <div className="disinab-faq__actions">
          <Button href="/dashboard/tickets/new" variant="secondary">
            ساخت تیکت
          </Button>
          <Button href="/courses" variant="secondary">
            دوره‌ها
          </Button>
        </div>
      </DisinabPlate>

      <DisinabPlate
        className="disinab-faq__feed"
        aura={false}
        as="section"
        aria-label="فهرست پرسش‌ها"
      >
        {items.length === 0 ? (
          <p className="disinab__line disinab-faq__empty">
            هنوز پرسش منتشرشده‌ای در دسترس نیست.
          </p>
        ) : (
          <ul className="disinab-faq__list">
            {items.map((item, index) => (
              <li
                key={item.id}
                style={{ "--faq-i": index } as CSSProperties}
              >
                <article className="disinab-faq__item">
                  <p className="disinab-faq__index" aria-hidden="true">
                    {(index + 1).toLocaleString("fa-IR").padStart(2, "۰")}
                  </p>
                  <div className="disinab-faq__copy">
                    <h2>{item.question}</h2>
                    <p>{item.answer}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </DisinabPlate>
    </div>
  );
}
