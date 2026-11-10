import Link from "next/link";
import { Badge, Button, Notice } from "@zharfa/ui";
import { fetchAdminCoupons } from "../../../lib/admin";

export default async function AdminCouponsPage() {
  const data = await fetchAdminCoupons();

  return (
    <section className="admin-page" aria-labelledby="admin-coupons-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">تجارت</p>
          <h1 id="admin-coupons-heading" className="admin-page__title">
            کوپن‌ها
          </h1>
          <p className="admin-page__subtitle">کدهای تخفیف و آمار استفاده.</p>
        </div>
        <Button href="/admin/coupons/new">کوپن جدید</Button>
      </header>

      {!data ? (
        <Notice tone="error" title="خطا">
          دریافت کوپن‌ها ممکن نشد.
        </Notice>
      ) : data.length === 0 ? (
        <Notice tone="information" title="خالی">
          کوپنی ثبت نشده. با «کوپن جدید» شروع کنید.
        </Notice>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>کد</th>
                <th>نوع</th>
                <th>مقدار</th>
                <th>استفاده</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link
                      href={`/admin/coupons/${c.id}`}
                      className="admin-table__primary"
                    >
                      {c.code}
                    </Link>
                  </td>
                  <td>{c.discountType === "PERCENT" ? "درصدی" : "مبلغ ثابت"}</td>
                  <td>
                    {c.discountType === "PERCENT"
                      ? `${(c.percentOff ?? 0).toLocaleString("fa-IR")}٪`
                      : `${Math.round((c.amountOffToman ?? 0) / 1000).toLocaleString("fa-IR")} هزارتومن`}
                  </td>
                  <td>
                    {c.redemptionCount.toLocaleString("fa-IR")}
                    {c.maxRedemptions != null
                      ? ` / ${c.maxRedemptions.toLocaleString("fa-IR")}`
                      : ""}
                  </td>
                  <td>
                    <Badge status={c.active ? "success" : "information"}>
                      {c.active ? "فعال" : "غیرفعال"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
