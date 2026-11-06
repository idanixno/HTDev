import { Badge, Notice } from "@zharfa/ui";
import { PaymentGatewayAdminForm } from "../../../components/admin/payment-gateway-form";
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
            پرچم‌های فنی و نمایش — سکرت‌ها فقط در env.
          </p>
        </div>
      </header>

      {!data ? (
        <Notice tone="error" title="خطا">دریافت تنظیمات درگاه ممکن نشد.</Notice>
      ) : (
        <>
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
                </tr>
              </thead>
              <tbody>
                {data.map((g) => (
                  <tr key={g.provider}>
                    <td className="admin-table__primary">{g.provider}</td>
                    <td>{g.technicalEnabled ? "روشن" : "خاموش"}</td>
                    <td>{g.checkoutVisible ? "بله" : "خیر"}</td>
                    <td>{g.isDefault ? "بله" : "—"}</td>
                    <td>{g.sandboxMode ? "بله" : "خیر"}</td>
                    <td>
                      <Badge
                        status={
                          g.credentialsStatus === "PRESENT"
                            ? "success"
                            : "information"
                        }
                      >
                        {g.credentialsStatus}
                      </Badge>
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
