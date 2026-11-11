"use client";

import { useState } from "react";

export function PaymentLicense({
  licenseKey,
  pending = false,
}: {
  licenseKey?: string | null;
  pending?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!licenseKey) return;
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <aside className="disinab-payment__license" aria-labelledby="payment-license-title">
      <div className="disinab-payment__license-head">
        <span
          className="disinab-payment__status"
          data-tone={licenseKey ? "success" : "pending"}
        >
          <span className="disinab-payment__status-dot" aria-hidden="true" />
          <strong>{licenseKey ? "ارسال شد" : "در حال صدور"}</strong>
        </span>
      </div>
      <h2 id="payment-license-title">لایسنس دوره</h2>
      <p className="disinab__line">
        {licenseKey
          ? "به‌صورت خودکار برای این سفارش صادر و در حساب شما ثبت شد. کپی کنید و در اسپات‌پلیر وارد کنید."
          : pending
            ? "پرداخت ثبت شده؛ لایسنس چند لحظه دیگر اینجا ظاهر می‌شود."
            : "پس از تأیید پرداخت، لایسنس اینجا نمایش داده می‌شود."}
      </p>

      {licenseKey ? (
        <div className="disinab__endpoint disinab-payment__license-box">
          <div className="disinab__endpoint-head">
            <span className="disinab__method">KEY</span>
            <span className="disinab__endpoint-label">کلید لایسنس</span>
          </div>
          <code className="disinab__endpoint-url" dir="ltr">
            {licenseKey}
          </code>
          <button type="button" className="disinab__copy" onClick={() => void copy()}>
            {copied ? "کپی شد" : "کپی لایسنس"}
          </button>
        </div>
      ) : (
        <p className="disinab-payment__license-wait">
          اگر ظاهر نشد، از «حساب من» وضعیت دسترسی را ببینید.
        </p>
      )}
    </aside>
  );
}
