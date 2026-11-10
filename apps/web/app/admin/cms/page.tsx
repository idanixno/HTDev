import Link from "next/link";
import { Badge, Button, Notice } from "@zharfa/ui";
import { FooterCmsEditorForm } from "../../../components/admin/footer-cms-editor-form";
import { HomeCmsEditorForm } from "../../../components/admin/home-cms-editor-form";
import {
  fetchAdminFaq,
  fetchAdminFooterCms,
  fetchAdminHomeCms,
} from "../../../lib/admin";

export default async function AdminCmsPage() {
  const [home, footer, faq] = await Promise.all([
    fetchAdminHomeCms(),
    fetchAdminFooterCms(),
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
            صفحهٔ خانه، نشان‌های فوتر، و پرسش‌های متداول.
          </p>
        </div>
        <Button href="/admin/cms/faq/new">پرسش جدید</Button>
      </header>

      {!home ? (
        <Notice tone="error" title="خطا">
          خواندن محتوای خانه ممکن نشد.
        </Notice>
      ) : (
        <article className="admin-panel">
          <h2>صفحهٔ خانه</h2>
          <HomeCmsEditorForm
            initial={{
              heroEyebrow: home.heroEyebrow ?? "",
              heroTitle: home.heroTitle,
              heroSubtitle: home.heroSubtitle ?? "",
              primaryCtaLabel: home.primaryCtaLabel ?? "",
              primaryCtaHref: home.primaryCtaHref ?? "",
              secondaryCtaLabel: home.secondaryCtaLabel ?? "",
              secondaryCtaHref: home.secondaryCtaHref ?? "",
            }}
          />
        </article>
      )}

      <article
        className="admin-panel"
        style={{ marginTop: "var(--zharfa-space-24)" }}
      >
        <h2>نشان‌های فوتر</h2>
        {!footer ? (
          <Notice tone="error" title="خطا">
            خواندن نشان‌های فوتر ممکن نشد.
          </Notice>
        ) : (
          <FooterCmsEditorForm
            initial={{
              enamadHtml: footer.enamadHtml ?? "",
              paymentGatewayHtml: footer.paymentGatewayHtml ?? "",
            }}
          />
        )}
      </article>

      <article
        className="admin-panel"
        style={{ marginTop: "var(--zharfa-space-24)" }}
      >
        <div className="admin-page__header" style={{ marginBottom: "1rem" }}>
          <h2>پرسش‌های متداول</h2>
        </div>
        {!faq ? (
          <Notice tone="error" title="خطا">
            خواندن FAQ ممکن نشد.
          </Notice>
        ) : faq.length === 0 ? (
          <Notice tone="information" title="خالی">
            هنوز سؤالی ثبت نشده. با «پرسش جدید» شروع کنید.
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
                      <Link
                        href={`/admin/cms/faq/${f.id}`}
                        className="admin-table__primary"
                      >
                        {f.question}
                      </Link>
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
