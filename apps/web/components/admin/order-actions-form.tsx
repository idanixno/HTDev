"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";
import { orderStatusLabel } from "../../lib/commerce-shared";

export function OrderActionsForm({
  orderId,
  status,
  allowedNextStatuses,
  canRetryLicense,
}: {
  orderId: string;
  status: string;
  allowedNextStatuses: string[];
  canRetryLicense: boolean;
}) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(allowedNextStatuses[0] ?? "");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState<"status" | "license" | null>(null);

  useEffect(() => {
    setNextStatus(allowedNextStatuses[0] ?? "");
  }, [allowedNextStatuses]);

  async function updateStatus() {
    if (!nextStatus) return;
    setBusy("status");
    setError(null);
    setNote(null);
    try {
      await authFetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setNote(
        nextStatus === "PAID"
          ? "پرداخت تأیید شد و صف صدور لایسنس آغاز شد."
          : `وضعیت به «${orderStatusLabel(nextStatus)}» به‌روز شد.`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در به‌روزرسانی وضعیت.");
    } finally {
      setBusy(null);
    }
  }

  async function retryLicense() {
    setBusy("license");
    setError(null);
    setNote(null);
    try {
      const res = await authFetch<{ note: string }>(
        `/api/admin/orders/${encodeURIComponent(orderId)}/retry-license`,
        { method: "POST" },
      );
      setNote(res.note || "در صف تلاش مجدد قرار گرفت.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در صدور مجدد لایسنس.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="admin-order-actions">
      {error ? (
        <Notice tone="error" title="خطا">
          {error}
        </Notice>
      ) : null}
      {note ? (
        <Notice tone="success" title="انجام شد">
          {note}
        </Notice>
      ) : null}

      {allowedNextStatuses.length > 0 ? (
        <div className="admin-order-actions__row">
          <label className="z-field admin-order-actions__field">
            <span className="z-field__label">تغییر وضعیت سفارش</span>
            <select
              className="z-field__control"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              disabled={busy !== null}
            >
              {allowedNextStatuses.map((s) => (
                <option key={s} value={s}>
                  {orderStatusLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="primary"
            loading={busy === "status"}
            disabled={busy !== null || !nextStatus}
            onClick={() => void updateStatus()}
          >
            {nextStatus === "PAID" ? "تأیید پرداخت" : "اعمال وضعیت"}
          </Button>
        </div>
      ) : (
        <p className="admin-page__hint">
          وضعیت فعلی ({orderStatusLabel(status)}) پایانی است و انتقال دیگری
          ندارد.
        </p>
      )}

      {canRetryLicense ? (
        <div className="admin-order-actions__license">
          <p className="admin-page__hint">
            صدور لایسنس اسپات‌پلیر جدا از وضعیت درگاه است. با تأیید، دوباره در
            صف صدور واقعی قرار می‌گیرد — کلید ساختگی ساخته نمی‌شود.
          </p>
          <Button
            type="button"
            variant="secondary"
            loading={busy === "license"}
            disabled={busy !== null}
            onClick={() => void retryLicense()}
          >
            تأیید / صدور مجدد لایسنس
          </Button>
        </div>
      ) : null}
    </div>
  );
}
