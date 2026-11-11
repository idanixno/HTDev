import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@zharfa/ui";
import { BrandText } from "../../../components/brand-text";
import { DisinabBadge, DisinabPlate } from "../../../components/disinab";
import { buildPageMetadata } from "../../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "شرایط استفاده",
  description: "شرایط استفاده از وب‌سایت و خرید دوره‌های DXCode.",
  path: "/terms",
});

const SECTIONS = [
  {
    title: "حساب",
    body: "هر شخص مسئول حفظ رمز حساب خود است. نام کاربری، ایمیل و شماره موبایل باید متعلق به خود کاربر باشد. DXCode می‌تواند نشست را پس از تغییر رمز باطل کند.",
  },
  {
    title: "دوره‌ها",
    body: "هر دوره جدا فروخته می‌شود. قیمت، وضعیت انتشار و سرفصل همان چیزی است که در لحظه خرید روی سرور ثبت می‌شود. مسیر یادگیری پیشنهاد ترتیب است و خرید یک دوره را به بقیه مسیر گره نمی‌زند.",
  },
  {
    title: "ویدیو",
    body: "پخش ویدیوی محافظت‌شده با اسپات‌پلیر انجام می‌شود. DXCode میزبان مستقل ویدیو نیست. دسترسی وقتی معتبر است که لایسنس از ارائه‌دهنده صادر شده باشد.",
  },
  {
    title: "محتوای سایت",
    body: "متن دوره‌ها، مقالات و طرح درس متعلق به DXCode است. کپی دوره‌ها برای بازنشر مجاز نیست.",
  },
] as const;

export default function TermsPage() {
  return (
    <div className="disinab-terms">
      <DisinabPlate
        className="disinab-terms__mast"
        aria-labelledby="terms-title"
      >
        <nav className="crumbs disinab-terms__crumbs" aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">/</span>
          <span>شرایط استفاده</span>
        </nav>
        <div className="disinab-terms__intro">
          <div>
            <h1 id="terms-title">شرایط استفاده</h1>
            <p className="disinab__line">
              با ساخت حساب یا خرید دوره، این شرایط را برای استفاده از{" "}
              <span className="dx-wordmark dx-wordmark--inline">DXCode</span>{" "}
              می‌پذیرید. این متن راهنمای محصول است و جایگزین مشاوره حقوقی مستقل
              نیست.
            </p>
          </div>
          <DisinabBadge tone="muted">قانون محصول</DisinabBadge>
        </div>
        <div className="disinab-terms__actions">
          <Button href="/faq" variant="secondary">
            پرسش‌های رایج
          </Button>
          <Button href="/courses" variant="secondary">
            دوره‌ها
          </Button>
        </div>
      </DisinabPlate>

      <DisinabPlate
        className="disinab-terms__body"
        aura={false}
        as="section"
        aria-label="بندهای شرایط"
      >
        <ul className="disinab-terms__list">
          {SECTIONS.map((section, index) => (
            <li
              key={section.title}
              style={{ "--term-i": index } as CSSProperties}
            >
              <article className="disinab-terms__item">
                <p className="disinab-terms__index" aria-hidden="true">
                  {(index + 1).toLocaleString("fa-IR").padStart(2, "۰")}
                </p>
                <div className="disinab-terms__copy">
                  <h2>{section.title}</h2>
                  <p>
                    <BrandText>{section.body}</BrandText>
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </DisinabPlate>
    </div>
  );
}
