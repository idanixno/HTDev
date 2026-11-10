import { Badge, Notice } from "@zharfa/ui";
import { PaymentGatewayAdminForm } from "../../../components/admin/payment-gateway-form";
import { providerLabel } from "../../../lib/commerce-shared";
import { fetchAdminGateways } from "../../../lib/admin";

export default async function AdminPaymentsPage() {
  const data = await fetchAdminGateways();

  return (
    <section className="admin-page" aria-labelledby="admin-pay-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">تنظیمات</p>
          <h1 id="admin-pay-heading" className="admin-page__title">
            درگاه‌های پرداخت
          </h1>
          <p className="admin-page__subtitle">
            آقای پرداخت در حالت سندباکس بدون پین واقعی آماده است (پین رسمی{" "}
            <code>sandbox</code>). سکرت تولید فقط در env.
          </p>
        </div>
      </header>

      {!data ? (
        <Notice tone="error" title="خطا">
          دریافت تنظیمات درگاه ممکن نشد.
        </Notice>
      ) : (
        <>
          <Notice tone="information" title="آقای پرداخت — سندباکس">
            با <code>AQAYE_PARDAKHT_SANDBOX=true</code> و پین خالی، create/verify
            با پین <code>sandbox</code> و آدرس{" "}
            <code>…/startpay/sandbox/&#123;transid&#125;</code> اجرا می‌شود.
            برای محیط واقعی پین درگاه را در env بگذارید و سندباکس را خاموش کنید.
          </Notice>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>درگاه</th>
                  <th>فنی</th>
                  <th>نمایش چک‌اوت</th>
                  <th>پیش‌فرض</th>
                  <th>سندباکس</th>
                  <th>اعتبارنامه</th>
                  <th>وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {data.map((g) => (
                  <tr key={g.provider}>
                    <td className="admin-table__primary">
                      {providerLabel(g.provider)}
                    </td>
                    <td>{g.technicalEnabled ? "روشن" : "خاموش"}</td>
                    <td>{g.checkoutVisible ? "بله" : "—"}</td>
                    <td>{g.isDefault ? "بله" : "—"}</td>
                    <td>{g.sandboxMode ? "بله" : "—"}</td>
                    <td>
                      <Badge
                        status={
                          g.credentialsStatus === "PRESENT"
                            ? "success"
                            : "information"
                        }
                      >
                        {g.credentialsStatus === "PRESENT"
                          ? "آماده"
                          : "نیاز به اعتبارنامه"}
                      </Badge>
                    </td>
                    <td>
                      {g.usableAtCheckout
                        ? "قابل خرید"
                        : g.integrationStatus ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaymentGatewayAdminForm gateways={data} />
        </>
      )}
    </section>
  );
}
