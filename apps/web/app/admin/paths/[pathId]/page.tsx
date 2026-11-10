import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Button, Notice } from "@zharfa/ui";
import { PathEditorForm } from "../../../../components/admin/path-editor-form";
import { fetchAdminPath } from "../../../../lib/admin";

type Params = Promise<{ pathId: string }>;

export default async function EditPathPage({ params }: { params: Params }) {
  const { pathId } = await params;
  const path = await fetchAdminPath(pathId);
  if (!path) notFound();

  return (
    <section className="admin-page" aria-labelledby="admin-path-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">نقشهٔ راه</p>
          <h1 id="admin-path-heading" className="admin-page__title">
            {path.title}
          </h1>
          <p className="admin-page__subtitle" dir="ltr">
            /paths/{path.slug}
          </p>
        </div>
        <Button href={`/admin/paths/${path.id}/steps/new`}>گام جدید</Button>
      </header>

      <article className="admin-panel">
        <h2>مشخصات مسیر</h2>
        <p className="admin-table__muted">
          عنوان و توضیح اینجا همان بخش مسیر در صفحهٔ عمومی نقشهٔ راه است.
        </p>
        <PathEditorForm
          pathId={path.id}
          initial={{
            slug: path.slug,
            title: path.title,
            summary: path.summary ?? "",
            description: path.description ?? "",
            coverAsset: path.coverAsset ?? "",
            published: path.published,
            sortOrder: String(path.sortOrder ?? 0),
          }}
        />
      </article>

      <article
        className="admin-panel"
        style={{ marginTop: "var(--zharfa-space-24)" }}
      >
        <h2>گام‌ها / جدول دوره‌ها</h2>
        <p className="admin-table__muted">
          ترتیب گام‌ها و دورهٔ وصل‌شده، ردیف‌های جدول «شماره / نام دوره» در
          نقشهٔ راه عمومی را می‌سازند.
        </p>
        {path.steps.length === 0 ? (
          <Notice tone="information" title="خالی">
            هنوز گامی ثبت نشده. با «گام جدید» شروع کنید.
          </Notice>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>گام</th>
                  <th>نمایه</th>
                </tr>
              </thead>
              <tbody>
                {path.steps.map((step) => (
                  <tr key={step.id}>
                    <td>
                      <Link
                        href={`/admin/paths/${path.id}/steps/${step.id}`}
                        className="admin-table__primary"
                      >
                        {step.sortOrder.toLocaleString("fa-IR")}. {step.title}
                      </Link>
                      <div className="admin-table__muted" dir="ltr">
                        /paths/{path.slug}/{step.slug}
                      </div>
                    </td>
                    <td>
                      <Badge status={step.noIndex ? "information" : "success"}>
                        {step.noIndex ? "خارج از نمایه" : "در نمایه"}
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
