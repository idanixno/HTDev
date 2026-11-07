import Link from "next/link";
import { Badge, Button, Notice } from "@zharfa/ui";
import { fetchAdminArticles, formatDateFa } from "../../../lib/admin";

export default async function AdminJournalPage() {
  const articles = await fetchAdminArticles();

  return (
    <section className="admin-page" aria-labelledby="admin-journal-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">انتشار</p>
          <h1 id="admin-journal-heading" className="admin-page__title">
            یادداشت‌ها
          </h1>
          <p className="admin-page__subtitle">
            نوشته‌های آموزشی عمومی. فقط موارد منتشرشده در سایت دیده می‌شوند.
          </p>
        </div>
        <Button href="/admin/journal/new">یادداشت جدید</Button>
      </header>
      {!articles ? (
        <Notice tone="error" title="خطا">
          دریافت یادداشت‌ها ممکن نشد.
        </Notice>
      ) : articles.length === 0 ? (
        <Notice tone="information" title="خالی">
          هنوز یادداشتی ثبت نشده است.
        </Notice>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>عنوان</th>
                <th>وضعیت</th>
                <th>به‌روز</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <Link href={`/admin/journal/${article.id}`} className="admin-table__primary">
                      {article.title}
                    </Link>
                    <div className="admin-table__muted" dir="ltr">
                      {article.slug}
                    </div>
                  </td>
                  <td>
                    <Badge status={article.published ? "success" : "information"}>
                      {article.published ? "منتشر" : "پیش‌نویس"}
                    </Badge>
                  </td>
                  <td>{formatDateFa(article.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
