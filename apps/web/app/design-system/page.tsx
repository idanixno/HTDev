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
            summary="مرزهای روشن؛ کدی که با تغییر نمی‌شکند."
            meta="پیشرفته · ۱۸ ساعت · ۴۲ درس"
            priceLabel="۲٬۴۰۰٬۰۰۰ تومان"
          />
          <CourseCard
            availability="publishedFree"
            indexLabel="۰۳"
            diagramCode="SYSTEM LAYERS"
            title="شروع کار با Linux"
            summary="یک شروع عملی برای کار با سیستم‌عامل."
            meta="مقدماتی · ۳ ساعت · ۱۲ درس"
            priceLabel="رایگان"
          />
          <CourseCard
            availability="comingSoon"
            indexLabel="۰۶"
            diagramCode="ANALYSIS PIPELINE"
            chainNodes={["BINARY", "DISASSEMBLY", "BEHAVIOR"]}
            title="مهندسی معکوس؛ مبانی تحلیل"
            summary="نگاهی روشمند به رفتار یک برنامه."
            meta="جزئیات پس از اعلام مدرس"
            priceLabel="به‌زودی"
          />
        </div>
      </section>

      <Dialog
        open={dialogOpen}
        title="لغو انتشار دوره؟ — Dialog"
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
