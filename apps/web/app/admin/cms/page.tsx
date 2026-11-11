import Link from "next/link";
import { Badge, Button, Notice } from "@zharfa/ui";
import { CourseNotesEditor } from "../../../components/admin/course-notes-editor";
import { FooterCmsEditorForm } from "../../../components/admin/footer-cms-editor-form";
import { HomeCmsEditorForm } from "../../../components/admin/home-cms-editor-form";
import { PathsCmsEditorForm } from "../../../components/admin/paths-cms-editor-form";
import {
  fetchAdminFaq,
  fetchAdminFooterCms,
  fetchAdminHomeCms,
  fetchAdminPathsCms,
} from "../../../lib/admin";

export default async function AdminCmsPage() {
  const [home, footer, faq, pathsCms] = await Promise.all([
    fetchAdminHomeCms(),
    fetchAdminFooterCms(),
    fetchAdminFaq(),
    fetchAdminPathsCms(),
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
            اطلاعیهٔ صفحهٔ اصلی، هیرو خانه، نقشهٔ راه، هدر و فوتر، نشان‌های
            اعتماد، نکات قبل از خرید، و پرسش‌های متداول.
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
              announcementEnabled: home.announcementEnabled ?? false,
              announcementText: home.announcementText ?? "",
              announcementHref: home.announcementHref ?? "",
              announcementCtaLabel: home.announcementCtaLabel ?? "",
            }}
          />
        </article>
      )}

      <article
        className="admin-panel"
        style={{ marginTop: "var(--zharfa-space-24)" }}
      >
        <h2>صفحهٔ نقشهٔ راه</h2>
        <p className="admin-table__muted">
          عنوان و متن معرفی بالای صفحهٔ{" "}
          <Link href="/paths">/paths</Link>. خود مسیرها و جدول دوره‌ها را از{" "}
          <Link href="/admin/paths">مدیریت مسیرها</Link> ویرایش کنید.
        </p>
        {!pathsCms ? (
          <Notice tone="error" title="خطا">
            خواندن محتوای نقشهٔ راه ممکن نشد.
          </Notice>
        ) : (
          <PathsCmsEditorForm
            initial={{
              title: pathsCms.title,
              lead: pathsCms.lead ?? "",
              seoTitle: pathsCms.seoTitle ?? "",
              seoDescription: pathsCms.seoDescription ?? "",
            }}
          />
        )}
      </article>

      <article
        className="admin-panel"
        style={{ marginTop: "var(--zharfa-space-24)" }}
      >
        <h2>هدر و فوتر سایت</h2>
        <p className="admin-table__muted">
          برند، منوی هدر، منوی موبایل، ستون‌های فوتر، دکمه‌های حساب، و نماد
          اینماد/درگاه — همه از اینجا کنترل می‌شود.
        </p>
        {!footer ? (
          <Notice tone="error" title="خطا">
            خواندن تنظیمات هدر و فوتر ممکن نشد.
          </Notice>
        ) : (
          <FooterCmsEditorForm
            initial={{
              brandName: footer.brandName,
              brandTagline: footer.brandTagline,
              brandKicker: footer.brandKicker,
              footerBlurb: footer.footerBlurb,
              headerLinks: footer.headerLinks,
              footerGroups: footer.footerGroups,
              mobileGroups: footer.mobileGroups,
              guestCtaLabel: footer.guestCtaLabel,
              guestCtaHref: footer.guestCtaHref,
              authedCtaLabel: footer.authedCtaLabel,
              authedCtaHref: footer.authedCtaHref,
              showCart: footer.showCart,
              showThemeToggle: footer.showThemeToggle,
              trustsLabel: footer.trustsLabel,
              mobileMenuTitle: footer.mobileMenuTitle,
              mobileMenuLine: footer.mobileMenuLine,
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
        <CourseNotesEditor
          title="نکات عمومی قبل از خرید"
          hint="این نکات روی همهٔ صفحات دوره نمایش داده می‌شوند. برای نکتهٔ اختصاصی، از ویرایش همان دوره استفاده کنید."
        />
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
