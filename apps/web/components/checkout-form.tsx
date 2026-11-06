"use client";

import { useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../lib/api-client";
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

  const [provider, setProvider] = useState(defaultProvider);
  const [couponCode, setCouponCode] = useState("");
  const [amountLabel, setAmountLabel] = useState(options.course.priceLabel);
  const [discountNote, setDiscountNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onValidateCoupon() {
    setError(null);
    setDiscountNote(null);
    if (!couponCode.trim()) {
      setAmountLabel(options.course.priceLabel);
      return;
    }
    try {
      const data = await authFetch<{
        amountLabel: string;
        discountToman: number;
        couponCode: string;
      }>("/api/commerce/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ courseSlug, couponCode }),
      });
      setAmountLabel(data.amountLabel);
      setDiscountNote(
        data.discountToman > 0
          ? `کد ${data.couponCode} اعمال شد.`
          : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "کد تخفیف نامعتبر است.");
      setAmountLabel(options.course.priceLabel);
    }
  }

  async function onPay() {
    setError(null);
    if (!options.purchaseEnabled || !provider) {
      setError(
        "هیچ درگاه قابل‌استفاده‌ای فعال نیست. تا زمانی که اعتبارنامهٔ واقعی تنظیم نشود، خرید پولی غیرفعال است.",
      );
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
      // Honest pending page before leaving to gateway.
      window.location.href = `/payments/pending?orderId=${encodeURIComponent(data.orderId)}&next=${encodeURIComponent(data.redirectUrl)}`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "شروع پرداخت ممکن نشد. موفقیت ساختگی نداریم.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="checkout-form">
      {!options.purchaseEnabled ? (
        <Notice tone="information" title="خرید پولی فعلاً غیرفعال است">
          {options.integrationNote ??
            "درگاه‌ها IMPLEMENTED_BUT_CREDENTIALS_REQUIRED هستند — بدون مرچنت‌آیدی واقعی پرداخت موفق نمی‌شود."}
        </Notice>
      ) : null}

      <dl className="checkout-form__summary">
        <div>
          <dt>دوره</dt>
          <dd>{options.course.title}</dd>
        </div>
        <div>
          <dt>مبلغ</dt>
          <dd>{amountLabel}</dd>
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

      <fieldset className="checkout-form__gateways" disabled={!options.purchaseEnabled}>
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
                {g.sandboxMode ? " · سندباکس" : ""}
                {g.isDefault ? " · پیش‌فرض" : ""}
              </span>
            </label>
          ))
        )}
      </fieldset>

      {options.gateways.some(
        (g) => g.integrationStatus === "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED",
      ) ? (
        <p className="checkout-form__cred-note">
          برخی درگاه‌ها پیاده‌سازی شده‌اند اما اعتبارنامه ندارند
          (IMPLEMENTED_BUT_CREDENTIALS_REQUIRED).
        </p>
      ) : null}

      {error ? (
        <Notice tone="error" title="خطا">
          {error}
        </Notice>
      ) : null}

      <div className="checkout-form__actions">
        <Button href={`/courses/${courseSlug}`} variant="secondary">
          بازگشت
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={!options.purchaseEnabled || busy}
          onClick={() => void onPay()}
        >
          {busy ? "در حال انتقال…" : "ادامه به درگاه"}
        </Button>
      </div>
    </div>
  );
}
