import Link from "next/link";
import type { CSSProperties } from "react";
import { Notice } from "@zharfa/ui";
import { BarBreakdown, LineChart } from "../../components/admin/charts";
import { AdminLiveBadge } from "../../components/admin/live-badge";
import {
  fetchAdminAnalytics,
  formatDateFa,
  formatTomanFa,
} from "../../lib/admin";

function defaultRange() {
  const to = new Date();
  const from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate() - 29));
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const fallback = defaultRange();
  const from = sp.from || fallback.from;
  const to = sp.to || fallback.to;
  const data = await fetchAdminAnalytics({ from, to });

  return (
    <section className="admin-page" aria-labelledby="admin-dash-heading">
      <header className="admin-page__header">
        <div className="admin-page__intro">
          <div className="admin-page__intro-top">
            <p className="admin-page__eyebrow">تحلیل‌ها</p>
            <AdminLiveBadge />
          </div>
          <h1 id="admin-dash-heading" className="admin-page__title">
            داشبورد مدیریت
          </h1>
          <p className="admin-page__subtitle">
            آمار واقعی از پایگاه‌داده، بدون عدد ساختگی.
          </p>
          <p className="admin-page__range-fa">
            بازهٔ شمسی: {formatDateFa(from)} تا {formatDateFa(to)}
          </p>
        </div>
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
      </header>

      {!data ? (
        <Notice tone="error" title="بارگذاری ناموفق">
          دریافت آمار ممکن نشد. نشست ادمین یا API را بررسی کنید.
        </Notice>
      ) : (
        <>
          <section className="admin-kpis" aria-label="شاخص‌های بازه">
            <header className="admin-kpis__head">
              <div>
                <p className="admin-kpis__eyebrow">شاخص‌ها</p>
                <h2 className="admin-kpis__title">خلاصهٔ بازه</h2>
              </div>
            </header>
            <div className="admin-kpis__grid">
              <article className="admin-kpi" data-tone="sale" style={{ "--kpi-i": 0 } as CSSProperties}>
                <p className="admin-kpi__label">درآمد پرداخت‌شده</p>
                <p className="admin-kpi__value">
                  {formatTomanFa(data.summary.revenueToman)}
                </p>
              </article>
              <article className="admin-kpi" data-tone="sale" style={{ "--kpi-i": 1 } as CSSProperties}>
                <p className="admin-kpi__label">سفارش‌های پرداخت‌شده</p>
                <p className="admin-kpi__value">
                  {data.summary.paidOrders.toLocaleString("fa-IR")}
                </p>
              </article>
              <article className="admin-kpi" data-tone="free" style={{ "--kpi-i": 2 } as CSSProperties}>
                <p className="admin-kpi__label">کاربران جدید</p>
                <p className="admin-kpi__value">
                  {data.summary.newUsers.toLocaleString("fa-IR")}
                </p>
              </article>
              <article className="admin-kpi" data-tone="success" style={{ "--kpi-i": 3 } as CSSProperties}>
                <p className="admin-kpi__label">دوره‌های منتشرشده</p>
                <p className="admin-kpi__value">
                  {data.summary.publishedCourses.toLocaleString("fa-IR")}
                </p>
              </article>
              <article className="admin-kpi" data-tone="pending" style={{ "--kpi-i": 4 } as CSSProperties}>
                <p className="admin-kpi__label">تیکت‌های باز</p>
                <p className="admin-kpi__value">
                  {data.summary.openTickets.toLocaleString("fa-IR")}
                </p>
              </article>
              <article className="admin-kpi" data-tone="warning" style={{ "--kpi-i": 5 } as CSSProperties}>
                <p className="admin-kpi__label">در صف صدور لایسنس</p>
                <p className="admin-kpi__value">
                  {data.summary.pendingProvisioning.toLocaleString("fa-IR")}
                </p>
              </article>
            </div>
          </section>

          <div className="admin-charts-grid">
            <LineChart
              chartId="revenue"
              title="درآمد روزانه (تومان)"
              series={data.series.revenueByDay}
              valueSuffix=" تومان"
            />
            <LineChart
              chartId="orders"
              title="سفارش‌های پرداخت‌شده روزانه"
              series={data.series.ordersByDay}
            />
            <LineChart
              chartId="users"
              title="ثبت‌نام کاربران روزانه"
              series={data.series.usersByDay}
            />
            <BarBreakdown
              title="سفارش‌ها بر اساس وضعیت"
              kind="orders"
              items={data.breakdowns.ordersByStatus}
            />
            <BarBreakdown
              title="دوره‌ها بر اساس انتشار"
              kind="courses"
              items={data.breakdowns.coursesByPublication}
            />
            <BarBreakdown
              title="تیکت‌ها بر اساس وضعیت"
              kind="tickets"
              items={data.breakdowns.ticketsByStatus}
            />
            <BarBreakdown
              title="لایسنس اسپات‌پلیر"
              kind="provisioning"
              items={data.breakdowns.provisioningByStatus}
            />
          </div>

          <p className="admin-page__hint">
            ماژول‌ها:{" "}
            <Link href="/admin/orders">سفارش‌ها</Link> ·{" "}
            <Link href="/admin/courses">دوره‌ها</Link> ·{" "}
            <Link href="/admin/tickets">تیکت‌ها</Link> ·{" "}
            <Link href="/admin/activity">گزارش فعالیت</Link>
          </p>
        </>
      )}
    </section>
  );
}
