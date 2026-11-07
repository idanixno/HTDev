import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@zharfa/ui";
import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "درباره ژرفا",
  description:
    "ژرفا آموزش فنی یک مدرس است: کشف دوره، خرید تکی، و دسترسی ویدیو از طریق اسپات‌پلیر.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <article className="editorial">
      <p className="editorial__eyebrow">ژرفا</p>
      <h1>آموزش عمیق، توسط یک مدرس</h1>
      <p className="editorial__lead">
        ژرفا ویترین و حساب آموزشی آرمان راد است. موضوع دوره‌ها به یک زبان یا
        فریم‌ورک محدود نمی‌شود؛ هر چه در کاتالوگ منتشر شود — از مبانی و معماری
        تا سیستم، شبکه و امنیت — با همان قواعد خرید و دسترسی عرضه می‌شود.
      </p>
      <h2>این سایت چه کاری می‌کند</h2>
      <ul>
        <li>دوره را با سطح، مدت، قیمت و سرفصل نشان می‌دهد.</li>
        <li>مسیر یادگیری ترتیب پیشنهادی است، نه اشتراک اجباری.</li>
        <li>پرداخت هر دوره جداست و فقط بعد از تأیید درگاه ثبت می‌شود.</li>
        <li>ویدیوی محافظت‌شده در اسپات‌پلیر پخش می‌شود، نه در یک پلیر داخلی.</li>
      </ul>
      <h2>چه چیزی اینجا ادعا نمی‌شود</h2>
      <p>
        تعداد دانشجو، امتیاز ستاره‌ای، یا نتیجه شغلی ساختگی در صفحات دوره نیست.
        اگر درسی پیش‌نمایش باشد، همان درس در سرفصل مشخص شده است. اگر درگاه یا
        اسپات‌پلیر پیکربندی نشده باشد، خرید و لایسنس موفق وانمود نمی‌شوند.
      </p>
      <div className="editorial__actions">
        <Button href="/courses">دیدن دوره‌ها</Button>
        <Button href="/paths" variant="secondary">
          مسیرهای یادگیری
        </Button>
      </div>
      <p>
        <Link href="/contact">تماس و پشتیبانی</Link>
      </p>
    </article>
  );
}
