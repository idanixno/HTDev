"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  CourseCard,
  Dialog,
  Field,
  Notice,
} from "@zharfa/ui";
import { AddToCartButton } from "../../../components/add-to-cart-button";

export default function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="ds-page">
      <header className="ds-page__intro">
        <p className="featured__eyebrow">ژرفا / کتابخانه اجزای بومی</p>
        <h1 className="featured__title">Design system</h1>
        <p className="featured__lead">
          اجزای Native assets از Figma — قابل دسترس و RTL.
        </p>
      </header>

      <section className="ds-section" aria-labelledby="ds-buttons">
        <h2 id="ds-buttons">Button</h2>
        <div className="ds-row">
          <Button variant="primary">ادامه</Button>
          <Button variant="secondary">از کجا شروع کنم؟</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" loading>
            در حال ارسال
          </Button>
          <Button variant="secondary" disabled>
            غیرفعال
          </Button>
          <Button variant="danger" onClick={() => setDialogOpen(true)}>
            باز کردن Dialog
          </Button>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-fields">
        <h2 id="ds-fields">Field</h2>
        <div className="ds-stack">
          <Field
            id="email-default"
            label="ایمیل — پیش‌فرض"
            placeholder="name@example.com"
            mono
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Field
            id="password-error"
            label="رمز عبور — خطا"
            type="password"
            defaultValue="••••••••"
            error="خطا: ایمیل یا رمز عبور صحیح نیست؛ دوباره بررسی کنید."
          />
          <Field
            id="order-disabled"
            label="شناسه سفارش — غیرفعال"
            defaultValue="JF-1042"
            mono
            disabled
          />
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-badges">
        <h2 id="ds-badges">Badge</h2>
        <div className="ds-row">
          <Badge status="success" />
          <Badge status="pending" />
          <Badge status="failure" />
          <Badge status="information" />
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-notices">
        <h2 id="ds-notices">Notice</h2>
        <div className="ds-stack">
          <Notice tone="success" title="تأیید شد">
            پیام وضعیت نمونه — بدون ادعای پرداخت یا مجوز ساختگی.
          </Notice>
          <Notice tone="information" title="پیام ثبت شد · Toast">
            پیام کوتاه غیرمسدودکننده؛ خطای مهم فقط در toast نمایش داده نشود.
          </Notice>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-cards">
        <h2 id="ds-cards">CourseCard</h2>
        <div className="featured__grid">
          <CourseCard
            availability="publishedPaid"
            title="معماری تمیز در عمل"
            href="/courses/clean-architecture"
            coverSrc="/artwork/courses/clean-architecture.svg"
            coverAlt="معماری تمیز در عمل"
            statusLabel="تکمیل ضبط"
            byline="ژرفا"
            durationLabel="۰۴:۰۰:۰۰"
            priceLabel="۲٬۴۰۰ هزارتومن"
            action={
              <AddToCartButton
                item={{
                  id: "ds-clean-architecture",
                  slug: "clean-architecture",
                  title: "معماری تمیز در عمل",
                  href: "/courses/clean-architecture",
                  coverAsset: "/artwork/courses/clean-architecture.svg",
                  priceToman: 2_400_000,
                  compareAtToman: null,
                  priceLabel: "۲٬۴۰۰ هزارتومن",
                  compareAtLabel: null,
                  discountLabel: null,
                }}
              />
            }
          />
          <CourseCard
            availability="preorder"
            title="امنیت API در عمل"
            href="/courses/api-security"
            coverSrc="/artwork/courses/api-security.svg"
            coverAlt="امنیت API در عمل"
            statusLabel="پیش‌فروش"
            byline="امنیت"
            durationLabel="۰۶:۲۰:۰۰"
            priceLabel="۱٬۹۰۰ هزارتومن"
            compareAtLabel="۲٬۲۰۰ هزارتومن"
            discountLabel="۱۴٪ تخفیف"
            action={
              <AddToCartButton
                item={{
                  id: "ds-api-security",
                  slug: "api-security",
                  title: "امنیت API در عمل",
                  href: "/courses/api-security",
                  coverAsset: "/artwork/courses/api-security.svg",
                  priceToman: 1_900_000,
                  compareAtToman: 2_200_000,
                  priceLabel: "۱٬۹۰۰ هزارتومن",
                  compareAtLabel: "۲٬۲۰۰ هزارتومن",
                  discountLabel: "۱۴٪ تخفیف",
                }}
              />
            }
          />
          <CourseCard
            availability="publishedFree"
            title="شروع کار با Linux"
            href="/courses/linux-intro"
            coverSrc="/artwork/courses/linux-intro.svg"
            coverAlt="شروع کار با Linux"
            statusLabel="تکمیل ضبط"
            byline="لینوکس"
            durationLabel="۰۲:۳۰:۰۰"
            priceLabel="رایگان"
            action={
              <p className="course-access-note">شما به این دوره دسترسی کامل دارید</p>
            }
          />
        </div>
      </section>

      <Dialog
        open={dialogOpen}
        title="لغو انتشار دوره؟ — Dialog"
        indexLabel="۰۷"
        footnote="تمرکز در dialog حبس شود؛ Escape برای خروج امن؛ بازگشت تمرکز به محرک."
        cancelLabel="لغو"
        confirmLabel="تأیید لغو انتشار"
        confirmDanger
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => setDialogOpen(false)}
      >
        ثبت‌نام جدید بسته می‌شود؛ دسترسی خریداران قبلی باید حفظ شود. این اقدام حذف
        دوره نیست. رفتار نهایی نیازمند تأیید محصول است.
      </Dialog>
    </div>
  );
}
