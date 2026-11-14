import Link from "next/link";
import { Notice } from "@zharfa/ui";
import { CoursePerformanceExport } from "../../../../components/admin/course-performance-export";
import {
  fetchAdminCoursePerformance,
  formatDateFa,
  formatTomanFa,
} from "../../../../lib/admin";
import { publicationStatusLabel } from "../../../../lib/status-labels";

function defaultRange() {
  const to = new Date();
  const from = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate() - 29),
  );
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default async function AdminCoursePerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const fallback = defaultRange();
  const from = params.from || fallback.from;
  const to = params.to || fallback.to;
  const report = await fetchAdminCoursePerformance({ from, to });

  return (
    <section
      className="admin-page admin-course-performance"
      aria-labelledby="course-performance-heading"
    >
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">تحلیل‌ها</p>
          <h1 id="course-performance-heading" className="admin-page__title">
            عملکرد دوره‌ها
          </h1>
          <p className="admin-page__subtitle">
            فروش پرداخت‌شده و ثبت‌نام‌های واقعی در بازهٔ انتخابی؛ بدون تخمین
            بازدید یا مصرف محتوا.
          </p>
          <p className="admin-page__range-fa">
            بازهٔ شمسی: {formatDateFa(from)} تا {formatDateFa(to)}
          </p>
        </div>
      </header>

      <div className="admin-course-performance__controls">
        <form className="admin-range" method="get">
          <p className="admin-range__legend">بازهٔ گزارش</p>
          <div className="admin-range__fields">
            <label>
              <span>از تاریخ</span>
              <input type="date" name="from" defaultValue={from} />
              <em>{formatDateFa(from)}</em>
            </label>
            <label>
              <span>تا تاریخ</span>
              <input type="date" name="to" defaultValue={to} />
              <em>{formatDateFa(to)}</em>
            </label>
          </div>
          <button type="submit" className="admin-range__submit">
            اعمال بازه
          </button>
        </form>

        {report ? <CoursePerformanceExport report={report} /> : null}
      </div>

      {!report ? (
        <Notice tone="error" title="بارگذاری ناموفق">
          گزارش عملکرد دوره‌ها دریافت نشد. نشست ادمین یا API را بررسی کنید.
        </Notice>
      ) : (
        <>
          <Notice tone="information" title="منبع و محدودیت داده">
            فروش فقط از سفارش‌هایی با وضعیت فعلی «پرداخت‌شده» محاسبه می‌شود؛
            سفارش‌های بازپرداخت‌شده در این ارقام نیستند. ثبت‌نام از رکوردهای
            Enrollment است. بازدید، نرخ تبدیل، شروع/پایان دوره و پیشرفت درس در
            سامانه ثبت نمی‌شود و در این گزارش قابل‌اندازه‌گیری نیست.
          </Notice>
          {report.items.length === 0 ? (
            <Notice tone="information" title="دوره‌ای ثبت نشده است">
              در کاتالوگ دوره‌ای برای گزارش وجود ندارد.
            </Notice>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>دوره</th>
                    <th>وضعیت انتشار</th>
                    <th>سفارش پرداخت‌شده</th>
                    <th>خریدار یکتا</th>
                    <th>درآمد پرداخت‌شده</th>
                    <th>ثبت‌نام</th>
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((course) => (
                    <tr key={course.courseId}>
                      <td>
                        <Link
                          href={`/admin/courses/${course.courseId}`}
                          className="admin-table__primary"
                        >
                          {course.title}
                        </Link>
                        <div className="admin-table__muted" dir="ltr">
                          {course.slug}
                        </div>
                      </td>
                      <td>
                        {publicationStatusLabel(course.publicationStatus)}
                      </td>
                      <td>{course.paidOrders.toLocaleString("fa-IR")}</td>
                      <td>{course.uniqueBuyers.toLocaleString("fa-IR")}</td>
                      <td>{formatTomanFa(course.revenueToman)}</td>
                      <td>{course.enrollments.toLocaleString("fa-IR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="admin-page__hint">
            آمار کل فروش در <Link href="/admin">داشبورد مدیریت</Link> ·{" "}
            <Link href="/admin/orders">مشاهدهٔ سفارش‌ها</Link>
          </p>
        </>
      )}
    </section>
  );
}
