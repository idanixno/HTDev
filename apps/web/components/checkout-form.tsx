"use client";

import { useMemo, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../lib/api-client";
import { formatTomanLabel } from "../lib/catalog";
import type { CheckoutOptions } from "../lib/commerce-shared";
import { providerLabel } from "../lib/commerce-shared";

type Props = {
  options: CheckoutOptions;
  courseSlug: string;
};

export function CheckoutForm({ options, courseSlug }: Props) {
  const usable = options.gateways.filter((g) => g.usableAtCheckout);
  const defaultProvider =
    usable.find((g) => g.isDefault)?.provider ?? usable[0]?.provider ?? "";
  const listPrice = options.course.priceToman;

  const [provider, setProvider] = useState(defaultProvider);
  const [couponCode, setCouponCode] = useState("");
  const [discountToman, setDiscountToman] = useState(0);
  const [amountToman, setAmountToman] = useState(listPrice);
  const [amountLabel, setAmountLabel] = useState(options.course.priceLabel);
  const [discountNote, setDiscountNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const listLabel = useMemo(() => formatTomanLabel(listPrice), [listPrice]);
  const discountLabel = useMemo(
    () => formatTomanLabel(discountToman),
    [discountToman],
  );

  async function onValidateCoupon() {
    setError(null);
    setDiscountNote(null);
    if (!couponCode.trim()) {
      setDiscountToman(0);
      setAmountToman(listPrice);
      setAmountLabel(options.course.priceLabel);
      return;
    }
    try {
      const data = await authFetch<{
        amountToman?: number;
        amountLabel: string;
        discountToman: number;
        couponCode: string;
      }>("/api/commerce/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ courseSlug, couponCode }),
      });
      const nextDiscount = Math.max(0, data.discountToman);
      const nextAmount =
        typeof data.amountToman === "number"
          ? data.amountToman
          : Math.max(0, listPrice - nextDiscount);
      setDiscountToman(nextDiscount);
      setAmountToman(nextAmount);
      setAmountLabel(data.amountLabel);
      setDiscountNote(
        nextDiscount > 0 ? `کد ${data.couponCode} اعمال شد.` : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "کد تخفیف نامعتبر است.");
      setDiscountToman(0);
      setAmountToman(listPrice);
      setAmountLabel(options.course.priceLabel);
    }
  }

  async function onPay() {
    setError(null);
    if (!options.purchaseEnabled || !provider) {
      setError("خرید این دوره الان ممکن نیست.");
      return;
    }
    setBusy(true);
    try {
      const data = await authFetch<{
        redirectUrl: string;
        orderId: string;
      }>("/api/commerce/checkout/start", {
        method: "POST",
        body: JSON.stringify({
          courseSlug,
          couponCode: couponCode.trim() || undefined,
          provider,
        }),
      });
      window.location.href = `/payments/pending?orderId=${encodeURIComponent(data.orderId)}&next=${encodeURIComponent(data.redirectUrl)}`;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "شروع پرداخت ممکن نشد.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="checkout-form checkout-form--invoice">
      {!options.purchaseEnabled ? (
        <Notice tone="information" title="خرید پولی فعلاً غیرفعال است">
          خرید این دوره الان ممکن نیست.
        </Notice>
      ) : null}

      <div className="checkout-invoice">
        <h2 className="checkout-invoice__title">خلاصه سفارش</h2>

        <ul className="checkout-invoice__rows">
          <li>
            <span>دوره</span>
            <strong>{options.course.title}</strong>
          </li>
          <li>
            <span>مبلغ دوره</span>
            <strong>{listLabel}</strong>
          </li>
          {discountToman > 0 ? (
            <li className="checkout-invoice__rows--discount">
              <span>تخفیف کد</span>
              <strong>−{discountLabel}</strong>
            </li>
          ) : null}
        </ul>

        <dl className="checkout-invoice__totals">
          <div>
            <dt>جمع قبل از تخفیف</dt>
            <dd>{listLabel}</dd>
          </div>
          {discountToman > 0 ? (
            <div className="checkout-invoice__savings">
              <dt>تخفیف</dt>
              <dd>−{discountLabel}</dd>
            </div>
          ) : null}
          <div className="checkout-invoice__grand">
            <dt>مبلغ قابل پرداخت</dt>
            <dd>{amountLabel || formatTomanLabel(amountToman)}</dd>
          </div>
        </dl>

        {discountNote ? (
          <p className="checkout-form__discount">{discountNote}</p>
        ) : null}

        <div className="checkout-form__coupon">
          <Field
            id="checkout-coupon"
            label="کد تخفیف (اختیاری)"
            name="coupon"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="مثلاً DEEP20"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => void onValidateCoupon()}
          >
            اعمال کد
          </Button>
        </div>

        <fieldset
          className="checkout-form__gateways"
          disabled={!options.purchaseEnabled}
        >
          <legend>درگاه پرداخت</legend>
          {usable.length === 0 ? (
            <p className="checkout-form__empty">
              درگاهی برای نمایش در تسویه‌حساب وجود ندارد.
            </p>
          ) : (
            usable.map((g) => (
              <label key={g.provider} className="checkout-form__gateway">
                <input
                  type="radio"
                  name="provider"
                  value={g.provider}
                  checked={provider === g.provider}
                  onChange={() => setProvider(g.provider)}
                />
                <span>
                  {providerLabel(g.provider)}
                  {g.isDefault ? " · پیش‌فرض" : ""}
                  {g.sandboxMode ? " · سندباکس" : ""}
                </span>
              </label>
            ))
          )}
        </fieldset>

        {error ? (
          <Notice tone="error" title="خطا">
            {error}
          </Notice>
        ) : null}

        <div className="checkout-form__actions">
          <Button
            type="button"
            variant="primary"
            disabled={!options.purchaseEnabled || busy}
            onClick={() => void onPay()}
          >
            {busy ? "در حال انتقال…" : "ادامه به درگاه"}
          </Button>
          <Button href={`/courses/${courseSlug}`} variant="secondary">
            بازگشت
          </Button>
        </div>
      </div>
    </div>
  );
}
