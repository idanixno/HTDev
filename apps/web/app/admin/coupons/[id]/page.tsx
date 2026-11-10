import { notFound } from "next/navigation";
import { CouponEditorForm } from "../../../../components/admin/coupon-editor-form";
import { fetchAdminCoupons } from "../../../../lib/admin";

type Params = Promise<{ id: string }>;

export default async function EditCouponPage({ params }: { params: Params }) {
  const { id } = await params;
  const coupons = await fetchAdminCoupons();
  const coupon = coupons?.find((item) => item.id === id);
  if (!coupon) notFound();

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">تجارت</p>
          <h1 className="admin-page__title">{coupon.code}</h1>
        </div>
      </header>
      <CouponEditorForm
        couponId={coupon.id}
        initial={{
          code: coupon.code,
          discountType:
            coupon.discountType === "FIXED_TOMAN" ? "FIXED_TOMAN" : "PERCENT",
          percentOff:
            coupon.percentOff != null ? String(coupon.percentOff) : "",
          amountOffToman:
            coupon.amountOffToman != null ? String(coupon.amountOffToman) : "",
          minOrderToman:
            coupon.minOrderToman != null ? String(coupon.minOrderToman) : "",
          maxDiscountToman:
            coupon.maxDiscountToman != null
              ? String(coupon.maxDiscountToman)
              : "",
          maxRedemptions:
            coupon.maxRedemptions != null ? String(coupon.maxRedemptions) : "",
          active: coupon.active,
        }}
      />
    </section>
  );
}
