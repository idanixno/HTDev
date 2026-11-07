import type { Metadata } from "next";
import { Button } from "@zharfa/ui";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "تماس و پشتیبانی",
  description:
    "پشتیبانی ژرفا از طریق تیکت داخل حساب انجام می‌شود. فرم عمومی پیام ذخیره نمی‌کند.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <article className="editorial">
      <p className="editorial__eyebrow">پشتیبانی</p>
      <h1>تماس با ژرفا</h1>
      <p className="editorial__lead">
        درخواست دسترسی، خرید و محتوای دوره از داخل حساب و با تیکت پیگیری می‌شود
        تا گفتگو به همان کاربر و، در صورت نیاز، همان دوره وصل بماند.
      </p>
      <h2>چطور پیام بدهید</h2>
      <ol>
        <li>وارد حساب شوید یا ثبت‌نام کنید.</li>
        <li>از بخش پشتیبانی یک تیکت با موضوع مشخص بسازید.</li>
        <li>اگر مسئله به یک دوره مربوط است، همان دوره را انتخاب کنید.</li>
      </ol>
      <p>
        نشانی ایمیل یا شماره عمومی جداگانه‌ای برای این نسخه اعلام نشده است.
        پاسخ مدرس در همان رشته تیکت ثبت می‌شود.
      </p>
      <div className="editorial__actions">
        <Button href="/dashboard/tickets/new">تیکت جدید</Button>
        <Button href="/faq" variant="secondary">
          پرسش‌های رایج
        </Button>
      </div>
    </article>
  );
}
