import Link from "next/link";
import { Notice } from "@zharfa/ui";
import { BarBreakdown, LineChart } from "../../components/admin/charts";
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
        <div>
          <p className="admin-page__eyebrow">تحلیل‌ها</p>
          <h1 id="admin-dash-heading" className="admin-page__title">
            داشبورد مدیریت
          </h1>
          <p className="admin-page__subtitle">
            اعداد واقعی از پایگاه‌داده — بدون متریک ساختگی.
          </p>
        </div>
        <form className="admin-range" method="get">
          <label>
            از
            <input type="date" name="from" defaultValue={from} />
          </label>
          <label>
            تا
            <input type="date" name="to" defaultValue={to} />
          </label>
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
          <p className="admin-page__hint">
            بازه: {formatDateFa(data.range.from)} تا{" "}
            {formatDateFa(data.range.to)}
          </p>

          <div className="admin-kpis">
            <article className="admin-kpi">
              <p className="admin-kpi__label">درآمد (پرداخت‌شده)</p>
              <p className="admin-kpi__value">
                {formatTomanFa(data.summary.revenueToman)}
              </p>
            </article>
            <article className="admin-kpi">
              <p className="admin-kpi__label">سفارش‌های PAID</p>
              <p className="admin-kpi__value">
                {data.summary.paidOrders.toLocaleString("fa-IR")}
              </p>
            </article>
            <article className="admin-kpi">
              <p className="admin-kpi__label">کاربران جدید</p>
              <p className="admin-kpi__value">
                {data.summary.newUsers.toLocaleString("fa-IR")}
              </p>
            </article>
            <article className="admin-kpi">
              <p className="admin-kpi__label">دوره‌های منتشر</p>
              <p className="admin-kpi__value">
                {data.summary.publishedCourses.toLocaleString("fa-IR")}
              </p>
            </article>
            <article className="admin-kpi">
              <p className="admin-kpi__label">تیکت‌های باز</p>
              <p className="admin-kpi__value">
                {data.summary.openTickets.toLocaleString("fa-IR")}
              </p>
            </article>
            <article className="admin-kpi">
              <p className="admin-kpi__label">در صف پرویژن</p>
              <p className="admin-kpi__value">
                {data.summary.pendingProvisioning.toLocaleString("fa-IR")}
              </p>
            </article>
          </div>

          <div className="admin-charts-grid">
            <LineChart
              title="درآمد روزانه (تومان)"
              series={data.series.revenueByDay}
              valueSuffix=" تومان"
            />
            <LineChart
              title="سفارش‌های پرداخت‌شده روزانه"
              series={data.series.ordersByDay}
            />
            <LineChart
              title="ثبت‌نام کاربران روزانه"
              series={data.series.usersByDay}
            />
            <BarBreakdown
              title="سفارش‌ها بر اساس وضعیت"
              items={data.breakdowns.ordersByStatus}
            />
            <BarBreakdown
              title="دوره‌ها بر اساس انتشار"
              items={data.breakdowns.coursesByPublication}
            />
            <BarBreakdown
              title="تیکت‌ها بر اساس وضعیت"
              items={data.breakdowns.ticketsByStatus}
            />
            <BarBreakdown
              title="لایسنس اسپات‌پلیر"
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
