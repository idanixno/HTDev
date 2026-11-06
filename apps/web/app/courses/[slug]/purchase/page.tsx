import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Notice } from "@zharfa/ui";
import { CheckoutForm } from "../../../../components/checkout-form";
import { fetchCheckoutOptions } from "../../../../lib/commerce";
import { privateMetadata } from "../../../../lib/seo";
import { fetchCurrentUser } from "../../../../lib/session";

type Params = Promise<{ slug: string }>;

export const metadata: Metadata = privateMetadata("خرید دوره");

export default async function PurchasePage({ params }: { params: Params }) {
  const { slug } = await params;
  const user = await fetchCurrentUser();
  if (!user) {
    redirect(`/login?next=/courses/${encodeURIComponent(slug)}/purchase`);
  }

  const options = await fetchCheckoutOptions(slug);
  if (!options) notFound();

  return (
    <section className="purchase" aria-labelledby="purchase-heading">
      <header className="purchase__header">
        <p className="purchase__eyebrow">تسویه‌حساب</p>
        <h1 id="purchase-heading" className="purchase__title">
          خرید «{options.course.title}»
        </h1>
        <p className="purchase__subtitle">
          مبلغ روی سرور محاسبه می‌شود. تا تأیید واقعی درگاه، سفارش پرداخت‌شده
          نمی‌شود.
        </p>
      </header>

      <CheckoutForm options={options} courseSlug={slug} />

      <Notice tone="information" title="بدون موفقیت ساختگی">
        بازگشت از مرورگر به‌تنهایی دسترسی نمی‌دهد — فقط پس از verify سمت سرور.
        SpotPlayer هنوز در فاز ۶ است.
      </Notice>

      <p className="purchase__back">
        <Link href={`/courses/${slug}`}>← بازگشت به صفحه دوره</Link>
      </p>
    </section>
  );
}
