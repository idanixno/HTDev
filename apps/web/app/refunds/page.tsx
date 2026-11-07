import type { Metadata } from "next";
import { Button } from "@zharfa/ui";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "بازپرداخت",
  description: "شرایط درخواست بازپرداخت دوره‌های ژرفا.",
  path: "/refunds",
});

export default function RefundsPage() {
  return (
    <article className="editorial">
      <p className="editorial__eyebrow">خرید</p>
      <h1>بازپرداخت</h1>
      <p className="editorial__lead">
        دوره محتوای دیجیتال است. بازگشت وجه خودکار نیست و به بررسی همان سفارش
        بستگی دارد.
      </p>
      <h2>چه زمانی درخواست معنی دارد</h2>
      <ul>
        <li>پرداخت تکرار شده و دو سفارش برای یک دوره ثبت شده است.</li>
        <li>دوره خریداری‌شده با سرفصل اعلام‌شده در لحظه خرید فرق اساسی دارد.</li>
        <li>دسترسی اسپات‌پلیر بعد از پرداخت تأییدشده ساخته نمی‌شود و مشکل از سمت ارائه دوره است.</li>
      </ul>
      <h2>چطور درخواست کنید</h2>
      <p>
        از حساب خود تیکت بسازید و شماره سفارش را بنویسید. وضعیت سفارش در تاریخچه
        پرداخت همان چیزی است که سرور از درگاه تأیید کرده است. تصمیم بازپرداخت در
        تیکت ثبت می‌شود؛ این صفحه به‌تنهایی وجه را برنمی‌گرداند.
      </p>
      <div className="editorial__actions">
        <Button href="/dashboard/orders" variant="secondary">
          تاریخچه سفارش‌ها
        </Button>
        <Button href="/contact">تماس با پشتیبانی</Button>
      </div>
    </article>
  );
}
