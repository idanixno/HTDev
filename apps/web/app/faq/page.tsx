import type { Metadata } from "next";
import { fetchFaq } from "../../lib/catalog";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "پرسش‌های رایج",
  description: "پاسخ پرسش‌های منتشرشده درباره خرید، دسترسی و پشتیبانی ژرفا.",
  path: "/faq",
});

export default async function FaqPage() {
  const items = await fetchFaq();

  return (
    <article className="editorial">
      <p className="editorial__eyebrow">پشتیبانی</p>
      <h1>پرسش‌های رایج</h1>
      <p className="editorial__lead">
        این فهرست از محتوای منتشرشده مدیریت خوانده می‌شود. اگر پاسخ این‌جا نیست،
        بعد از ورود تیکت بسازید.
      </p>
      {items.length === 0 ? (
        <p>هنوز پرسش منتشرشده‌ای در دسترس نیست.</p>
      ) : (
        <div className="faq-list">
          {items.map((item) => (
            <section key={item.id} className="faq-list__item">
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
