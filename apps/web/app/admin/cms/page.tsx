import { Badge, Notice } from "@zharfa/ui";
import { fetchAdminFaq, fetchAdminHomeCms } from "../../../lib/admin";

export default async function AdminCmsPage() {
  const [home, faq] = await Promise.all([
    fetchAdminHomeCms(),
    fetchAdminFaq(),
  ]);

  return (
    <section className="admin-page" aria-labelledby="admin-cms-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">محتوا</p>
          <h1 id="admin-cms-heading" className="admin-page__title">
            CMS پایه
          </h1>
          <p className="admin-page__subtitle">
            محتوای صفحهٔ خانه و پرسش‌های متداول.
          </p>
        </div>
      </header>

      {!home ? (
        <Notice tone="error" title="خطا">
          خواندن محتوای خانه ممکن نشد.
        </Notice>
      ) : (
        <article className="admin-panel">
          <h2>صفحهٔ خانه</h2>
          <dl className="admin-dl">
            <div>
              <dt>ابرو</dt>
              <dd>{home.heroEyebrow ?? "—"}</dd>
            </div>
            <div>
              <dt>عنوان</dt>
              <dd>{home.heroTitle}</dd>
            </div>
            <div>
              <dt>زیرعنوان</dt>
              <dd>{home.heroSubtitle ?? "—"}</dd>
            </div>
            <div>
              <dt>CTA اصلی</dt>
              <dd>
                {home.primaryCtaLabel ?? "—"}
                {home.primaryCtaHref ? ` → ${home.primaryCtaHref}` : ""}
              </dd>
            </div>
            <div>
              <dt>CTA فرعی</dt>
              <dd>
                {home.secondaryCtaLabel ?? "—"}
                {home.secondaryCtaHref ? ` → ${home.secondaryCtaHref}` : ""}
              </dd>
            </div>
          </dl>
        </article>
      )}

      <article className="admin-panel" style={{ marginTop: "var(--zharfa-space-24)" }}>
        <h2>پرسش‌های متداول</h2>
        {!faq ? (
          <Notice tone="error" title="خطا">
            خواندن FAQ ممکن نشد.
          </Notice>
        ) : faq.length === 0 ? (
          <Notice tone="information" title="خالی">
            هنوز سؤالی ثبت نشده.
          </Notice>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>سؤال</th>
                  <th>ترتیب</th>
                  <th>انتشار</th>
                </tr>
              </thead>
              <tbody>
                {faq.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="admin-table__primary">{f.question}</div>
                      <div className="admin-table__muted">{f.answer}</div>
                    </td>
                    <td>{f.sortOrder}</td>
                    <td>
                      <Badge status={f.published ? "success" : "information"}>
                        {f.published ? "منتشر" : "پیش‌نویس"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
