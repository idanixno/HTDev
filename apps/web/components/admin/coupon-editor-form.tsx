"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Field, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";

export type CouponEditorInitial = {
  code: string;
  discountType: "PERCENT" | "FIXED_TOMAN";
  percentOff: string;
  amountOffToman: string;
  minOrderToman: string;
  maxDiscountToman: string;
  maxRedemptions: string;
  active: boolean;
};

const EMPTY: CouponEditorInitial = {
  code: "",
  discountType: "PERCENT",
  percentOff: "10",
  amountOffToman: "",
  minOrderToman: "",
  maxDiscountToman: "",
  maxRedemptions: "",
  active: true,
};

export function CouponEditorForm({
  couponId,
  initial,
}: {
  couponId?: string;
  initial?: Partial<CouponEditorInitial>;
}) {
  const router = useRouter();
  const [values, setValues] = useState<CouponEditorInitial>({
    ...EMPTY,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function patch(partial: Partial<CouponEditorInitial>) {
    setValues((prev) => ({ ...prev, ...partial }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const saved = await authFetch<{ id: string }>(
        couponId ? `/api/admin/coupons/${couponId}` : "/api/admin/coupons",
        {
          method: couponId ? "PATCH" : "POST",
          body: JSON.stringify({
            code: values.code.trim(),
            discountType: values.discountType,
            percentOff:
              values.discountType === "PERCENT"
                ? Number(values.percentOff || 0)
                : null,
            amountOffToman:
              values.discountType === "FIXED_TOMAN"
                ? Number(values.amountOffToman || 0)
                : null,
            minOrderToman: values.minOrderToman.trim()
              ? Number(values.minOrderToman)
              : null,
            maxDiscountToman: values.maxDiscountToman.trim()
              ? Number(values.maxDiscountToman)
              : null,
            maxRedemptions: values.maxRedemptions.trim()
              ? Number(values.maxRedemptions)
              : null,
            active: values.active,
          }),
        },
      );
      router.push(`/admin/coupons/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره کوپن ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function removeCoupon() {
    if (!couponId) return;
    if (!window.confirm("این کد تخفیف حذف شود؟")) return;
    setLoading(true);
    setError(null);
    try {
      await authFetch(`/api/admin/coupons/${couponId}`, { method: "DELETE" });
      router.push("/admin/coupons");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف کوپن ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="editor-form" onSubmit={onSubmit}>
      {error ? (
        <Notice tone="error" title="ذخیره نشد">
          {error}
        </Notice>
      ) : null}
      <div className="editor-form__grid">
        <Field
          id="coupon-code"
          name="code"
          label="کد تخفیف"
          mono
          dir="ltr"
          value={values.code}
          onChange={(e) => patch({ code: e.target.value })}
          required
        />
        <label className="z-field">
          <span className="z-field__label">نوع تخفیف</span>
          <select
            className="z-field__control"
            value={values.discountType}
            onChange={(e) =>
              patch({
                discountType: e.target.value as CouponEditorInitial["discountType"],
              })
            }
          >
            <option value="PERCENT">درصدی</option>
            <option value="FIXED_TOMAN">مبلغ ثابت (تومان)</option>
          </select>
        </label>
        {values.discountType === "PERCENT" ? (
          <Field
            id="coupon-percent"
            name="percentOff"
            label="درصد تخفیف"
            type="number"
            value={values.percentOff}
            onChange={(e) => patch({ percentOff: e.target.value })}
            required
          />
        ) : (
          <Field
            id="coupon-amount"
            name="amountOffToman"
            label="مبلغ تخفیف (تومان)"
            type="number"
            value={values.amountOffToman}
            onChange={(e) => patch({ amountOffToman: e.target.value })}
            required
          />
        )}
        <Field
          id="coupon-min"
          name="minOrderToman"
          label="حداقل مبلغ سفارش"
          type="number"
          value={values.minOrderToman}
          onChange={(e) => patch({ minOrderToman: e.target.value })}
        />
        <Field
          id="coupon-max"
          name="maxDiscountToman"
          label="سقف تخفیف (تومان)"
          type="number"
          value={values.maxDiscountToman}
          onChange={(e) => patch({ maxDiscountToman: e.target.value })}
        />
        <Field
          id="coupon-max-uses"
          name="maxRedemptions"
          label="حداکثر استفاده"
          type="number"
          value={values.maxRedemptions}
          onChange={(e) => patch({ maxRedemptions: e.target.value })}
        />
        <label className="editor-check">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => patch({ active: e.target.checked })}
          />
          <span>فعال</span>
        </label>
      </div>
      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          {couponId ? "ذخیره کوپن" : "ایجاد کوپن"}
        </Button>
        <Button href="/admin/coupons" variant="secondary">
          بازگشت
        </Button>
        {couponId ? (
          <Button
            type="button"
            variant="danger"
            loading={loading}
            onClick={removeCoupon}
          >
            حذف
          </Button>
        ) : null}
      </div>
    </form>
  );
}
