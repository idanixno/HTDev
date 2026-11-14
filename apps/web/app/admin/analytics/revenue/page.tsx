import Link from "next/link";
import type { CSSProperties } from "react";
import { Notice } from "@zharfa/ui";
import { LineChart } from "../../../../components/admin/charts";
import {
  fetchAdminRevenueAnalytics,
  formatDateFa,
  formatTomanFa,
} from "../../../../lib/admin";

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

export default async function AdminRevenueAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const fallback = defaultRange();
  const from = params.from || fallback.from;
  const to = params.to || fallback.to;
  const report = await fetchAdminRevenueAnalytics({ from, to });

  return (
    <section className="admin-page" aria-labelledby="revenue-analytics-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">تحلیل‌ها</p>
          <h1 id="revenue-analytics-heading" className="admin-page__title">
            تحلیل درآمد
          </h1>
          <p className="admin-page__subtitle">
            جمع‌بندی سفارش‌های پرداخت‌شده در بازه؛ مبالغ بر اساس وضعیت فعلی سفارش
            محاسبه می‌شوند.
          </p>
          <p className="admin-page__range-fa">
            بازهٔ شمسی: {formatDateFa(from)} تا {formatDateFa(to)}
          </p>
        </div>
      </header>

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

      {!report ? (
        <Notice tone="error" title="بارگذاری ناموفق">
          گزارش درآمد دریافت نشد. نشست ادمین یا API را بررسی کنید.
        </Notice>
      ) : (
        <>
          <Notice tone="information" title="محدودیت بازپرداخت">
            مبلغ بازپرداخت واقعی یا جزئی در پایگاه‌داده ثبت نمی‌شود. مبلغ
            بازپرداخت در این گزارش فقط ارزش کامل سفارش‌هایی است که وضعیت فعلی‌شان
            «بازپرداخت‌شده» علامت خورده؛ این رقم تأیید تراکنش بانکی نیست. بازه
            تاریخ بر اساس زمان پرداخت سفارش است، نه زمان بازپرداخت.
          </Notice>

          <section className="admin-kpis" aria-label="شاخص‌های درآمد">
            <header className="admin-kpis__head">
              <div>
                <p className="admin-kpis__eyebrow">فروش</p>
                <h2 className="admin-kpis__title">خلاصهٔ مالی</h2>
              </div>
            </header>
            <div className="admin-kpis__grid">
              <article
                className="admin-kpi"
                data-tone="sale"
                style={{ "--kpi-i": 0 } as CSSProperties}
              >
                <p className="admin-kpi__label">ارزش سفارش‌های وصول‌شده</p>
                <p className="admin-kpi__value">
                  {formatTomanFa(report.summary.orderValueToman)}
                </p>
              </article>
              <article
                className="admin-kpi"
                data-tone="warning"
                style={{ "--kpi-i": 1 } as CSSProperties}
              >
                <p className="admin-kpi__label">ارزش سفارش‌های علامت‌خوردهٔ بازپرداخت</p>
                <p className="admin-kpi__value">
                  {formatTomanFa(report.summary.markedRefundOrderValueToman)}
                </p>
              </article>
              <article
                className="admin-kpi"
                data-tone="success"
                style={{ "--kpi-i": 2 } as CSSProperties}
              >
                <p className="admin-kpi__label">ارزش سفارش‌های با وضعیت پرداخت‌شده</p>
                <p className="admin-kpi__value">
                  {formatTomanFa(report.summary.paidOrderValueToman)}
                </p>
              </article>
              <article
                className="admin-kpi"
                data-tone="free"
                style={{ "--kpi-i": 3 } as CSSProperties}
              >
                <p className="admin-kpi__label">میانگین ارزش سفارش وصول‌شده</p>
                <p className="admin-kpi__value">
                  {formatTomanFa(report.summary.averageOrderValueToman)}
                </p>
              </article>
            </div>
            <p className="admin-page__hint">
              {report.summary.paidOrders.toLocaleString("fa-IR")} سفارش با وضعیت
              پرداخت‌شده ·{" "}
              {report.summary.ordersMarkedRefunded.toLocaleString("fa-IR")} سفارش
              علامت‌خوردهٔ بازپرداخت · خالص بر اساس وضعیت فعلی:{" "}
              {formatTomanFa(report.summary.netOrderValueToman)}
            </p>
          </section>

          <div className="admin-charts-grid">
            <LineChart
              chartId="revenue-net-paid"
              title="مبلغ سفارش‌های با وضعیت پرداخت‌شده (هزارتومن)"
              series={report.daily.map((point) => ({
                date: point.date,
                value: Math.round(point.paidOrderValueToman / 1000),
              }))}
              valueSuffix=" هزارتومن"
            />
            <LineChart
              chartId="revenue-marked-refunds"
              title="ارزش سفارش‌های علامت‌خوردهٔ بازپرداخت (هزارتومن)"
              series={report.daily.map((point) => ({
                date: point.date,
                value: Math.round(point.markedRefundOrderValueToman / 1000),
              }))}
              valueSuffix=" هزارتومن"
            />
          </div>

          {report.courses.length === 0 ? (
            <Notice tone="information" title="سفارشی در این بازه ثبت نشده است">
              در بازهٔ انتخابی پرداختی ثبت نشده است.
            </Notice>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>دوره</th>
                    <th>سفارش‌های پرداخت‌شده</th>
                    <th>سفارش‌های علامت‌خوردهٔ بازپرداخت</th>
                    <th>ارزش وصول‌شده</th>
                    <th>ارزش علامت‌خوردهٔ بازپرداخت</th>
                    <th>خالص بر اساس وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {report.courses.map((course) => (
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
                      <td>{course.paidOrders.toLocaleString("fa-IR")}</td>
                      <td>
                        {course.ordersMarkedRefunded.toLocaleString("fa-IR")}
                      </td>
                      <td>{formatTomanFa(course.orderValueToman)}</td>
                      <td>
                        {formatTomanFa(course.markedRefundOrderValueToman)}
                      </td>
                      <td>{formatTomanFa(course.paidOrderValueToman)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="admin-page__hint">
            برای ریز فروش و ثبت‌نام هر دوره به{" "}
            <Link href="/admin/analytics/courses">عملکرد دوره‌ها</Link> ·{" "}
            <Link href="/admin/orders">فهرست سفارش‌ها</Link>
          </p>
        </>
      )}
    </section>
  );
}
