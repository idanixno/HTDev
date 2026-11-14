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
import { DxCodeLogo } from "../../../components/dxcode-logo";
import { DxCodeWordmark } from "../../../components/dxcode-wordmark";

export default function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="ds-page">
      <header className="ds-page__intro">
        <p className="featured__eyebrow dx-kicker">VISUAL IDENTITY // TYPE</p>
        <h1 className="featured__title">
          <DxCodeWordmark /> Design System
        </h1>
        <p className="featured__lead">
          دانش‌پورتال DXCode — تایپوگرافی برند، نشان درگاه، و اجزای Native RTL.
        </p>
      </header>

      <section className="ds-section" aria-labelledby="ds-type">
        <h2 id="ds-type">Typography</h2>
        <div className="ds-type-grid">
          <article className="ds-type-card">
            <p className="dx-kicker">01 // Brand</p>
            <DxCodeWordmark className="ds-type-card__specimen" />
            <p className="ds-type-card__meta">
              Orbitron · wordmark Latin · `--dx-font-brand`
            </p>
          </article>
          <article className="ds-type-card">
            <p className="dx-kicker">02 // Tech kicker</p>
            <p className="ds-type-card__specimen ds-type-card__specimen--tech">
              GATEWAY TO DEEP TECHNICAL CAPABILITY
            </p>
            <p className="ds-type-card__meta">
              JetBrains Mono · tracked caps · `--dx-font-tech`
            </p>
          </article>
          <article className="ds-type-card">
            <p className="dx-kicker">03 // Persian UI</p>
            <p className="ds-type-card__specimen ds-type-card__specimen--fa">
              از یادگیری کد تا درک مهندسی
            </p>
            <p className="ds-type-card__meta">
              IRANSans · primary UI · `--zharfa-font-persian`
            </p>
          </article>
          <article className="ds-type-card">
            <p className="dx-kicker">04 // Latin UI</p>
            <p className="ds-type-card__specimen ds-type-card__specimen--latin">
              Plus Jakarta Sans for mixed English UI
            </p>
            <p className="ds-type-card__meta">
              Plus Jakarta Sans · `--zharfa-font-latin`
            </p>
          </article>
        </div>
        <div className="ds-type-ethos" aria-label="Portal ethos">
          <p className="dx-kicker">CORE ARCHITECTURE // THE PORTAL ETHOS</p>
          <ul>
            <li>
              <span>01</span> UNDERSTANDING <em>&gt;</em> MEMORIZING
            </li>
            <li>
              <span>02</span> BUILDING <em>&gt;</em> CONSUMING
            </li>
            <li>
              <span>03</span> EXPLORATION <em>&gt;</em> BLIND INSTRUCTION
            </li>
            <li>
              <span>04</span> ENGINEERING <em>&gt;</em> SUPERFICIAL CODING
            </li>
          </ul>
        </div>
      </section>

      <section className="ds-section" aria-labelledby="ds-mark">
        <h2 id="ds-mark">Portal mark</h2>
        <div className="ds-row ds-row--marks">
          <DxCodeLogo className="ds-mark-lg" title="DXCode portal" />
          <div>
            <DxCodeWordmark className="ds-type-card__specimen" />
            <p className="featured__lead" style={{ marginTop: 8 }}>
              Interlocking DXCode mark in white on deep navy. The favicon uses
              the same geometry.
            </p>
          </div>
        </div>
      </section>

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
            defaultValue="DX-1042"
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
            byline="DXCode"
            durationLabel="۰۴:۰۰:۰۰"
            priceLabel="۲٫۴ میلیون تومن"
            action={
              <Button href="/courses/clean-architecture/purchase">
                ثبت‌نام در دوره
              </Button>
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
            priceLabel="۱٫۹ میلیون تومن"
            compareAtLabel="۲٫۲ میلیون تومن"
            discountLabel="۱۴٪ تخفیف"
            action={
              <Button href="/courses/api-security/purchase">
                ثبت‌نام در دوره
              </Button>
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
