import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckoutForm } from "../../../../../components/checkout-form";
import { fetchCheckoutOptions } from "../../../../../lib/commerce";
import { privateMetadata } from "../../../../../lib/seo";
import { fetchCurrentUser } from "../../../../../lib/session";

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
    <section
      className="purchase purchase--live"
      aria-labelledby="purchase-heading"
    >
      <header className="purchase-mast">
        <div className="purchase-mast__head">
          <h1 id="purchase-heading" className="purchase-mast__title">
            خرید آموزش «{options.course.title}»
          </h1>
          <span className="purchase-mast__badge">۱ دوره</span>
        </div>
        <p className="purchase-mast__lead">
          مبلغ روی سرور محاسبه می‌شود. تا تأیید واقعی درگاه، سفارش پرداخت‌شده
          نمی‌شود.
        </p>
      </header>

      <CheckoutForm options={options} courseSlug={slug} />

      <p className="purchase__back">
        <Link href={`/courses/${slug}`}>بازگشت به صفحه دوره</Link>
      </p>
    </section>
  );
}
