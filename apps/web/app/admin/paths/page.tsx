import Link from "next/link";
import { Badge, Button, Notice } from "@zharfa/ui";
import { fetchAdminPaths } from "../../../lib/admin";

export default async function AdminPathsPage() {
  const paths = await fetchAdminPaths();

  return (
    <section className="admin-page" aria-labelledby="admin-paths-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">نقشهٔ راه</p>
          <h1 id="admin-paths-heading" className="admin-page__title">
            مسیرها
          </h1>
          <p className="admin-page__subtitle">
            ساخت و ویرایش مسیرهای یادگیری و گام‌های هر مسیر.
          </p>
        </div>
        <Button href="/admin/paths/new">مسیر جدید</Button>
      </header>
      {!paths ? (
        <Notice tone="error" title="خطا">
          دریافت مسیرها ممکن نشد.
        </Notice>
      ) : paths.length === 0 ? (
        <Notice tone="information" title="خالی">
          مسیری ثبت نشده است. با «مسیر جدید» شروع کنید.
        </Notice>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>مسیر</th>
                <th>گام‌ها</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {paths.map((path) => (
                <tr key={path.id}>
                  <td>
                    <Link
                      href={`/admin/paths/${path.id}`}
                      className="admin-table__primary"
                    >
                      {path.title}
                    </Link>
                    <div className="admin-table__muted" dir="ltr">
                      /paths/{path.slug}
                    </div>
                  </td>
                  <td>{path.steps.length.toLocaleString("fa-IR")}</td>
                  <td>
                    <Badge status={path.published ? "success" : "information"}>
                      {path.published ? "منتشر" : "پیش‌نویس"}
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
