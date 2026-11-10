import { CouponEditorForm } from "../../../../components/admin/coupon-editor-form";

export default function NewCouponPage() {
  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">تجارت</p>
          <h1 className="admin-page__title">کوپن جدید</h1>
        </div>
      </header>
      <CouponEditorForm />
    </section>
  );
}
