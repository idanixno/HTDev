import Link from "next/link";
import { Button, Notice } from "@zharfa/ui";
import { fetchAdminTopics } from "../../../lib/admin";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  PUBLISHED: "منتشرشده",
  ARCHIVED: "بایگانی",
};

export default async function AdminTopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const data = await fetchAdminTopics({
    q: sp.q,
    status: sp.status,
  });

  return (
    <section className="admin-page" aria-labelledby="admin-topics-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">کاتالوگ</p>
          <h1 id="admin-topics-heading" className="admin-page__title">
            موضوعات (هاب سئو)
          </h1>
          <p className="admin-page__subtitle">
            هاب‌های موضوعی مستقل از دستهٔ تخت دوره‌ها — URL عمومی{" "}
            <code dir="ltr">/topics/&#123;slug&#125;</code>
          </p>
        </div>
        <Button href="/admin/topics/new">موضوع جدید</Button>
      </header>

      <form className="admin-filters" method="get">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="جست‌وجوی نام یا اسلاگ"
          className="field__control"
        />
        <select
          name="status"
          defaultValue={sp.status ?? ""}
          className="field__control"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="DRAFT">پیش‌نویس</option>
          <option value="PUBLISHED">منتشرشده</option>
          <option value="ARCHIVED">بایگانی</option>
        </select>
        <Button type="submit" variant="secondary">
          فیلتر
        </Button>
      </form>

      {!data ? (
        <Notice tone="error" title="خطا">
          دریافت موضوعات ممکن نشد.
        </Notice>
      ) : data.items.length === 0 ? (
        <Notice tone="information" title="خالی">
          موضوعی ثبت نشده.
        </Notice>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>نام</th>
                <th>اسلاگ</th>
                <th>والد</th>
                <th>وضعیت</th>
                <th>ایندکس</th>
                <th>دوره</th>
                <th>مقاله</th>
                <th>ترتیب</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((topic) => (
                <tr key={topic.id}>
                  <td>
                    <Link
                      href={`/admin/topics/${topic.id}`}
                      className="admin-table__primary"
                    >
                      {topic.name}
                    </Link>
                  </td>
                  <td className="admin-table__muted" dir="ltr">
                    {topic.slug}
                  </td>
                  <td>{topic.parent?.name ?? "—"}</td>
                  <td>{STATUS_LABEL[topic.status] ?? topic.status}</td>
                  <td>{topic.indexable ? "بله" : "خیر"}</td>
                  <td>{topic.courseCount.toLocaleString("fa-IR")}</td>
                  <td>{topic.articleCount.toLocaleString("fa-IR")}</td>
                  <td>{topic.sortOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
