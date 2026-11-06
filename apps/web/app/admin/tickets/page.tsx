import Link from "next/link";
import { Badge, Notice } from "@zharfa/ui";
import {
  fetchAdminTickets,
  ticketStatusBadge,
  ticketStatusLabel,
  type TicketStatus,
} from "../../../lib/tickets";
import { formatDateFa } from "../../../lib/admin";

const FILTERS: { label: string; status?: TicketStatus }[] = [
  { label: "همه" },
  { label: "باز", status: "OPEN" },
  { label: "در حال رسیدگی", status: "IN_PROGRESS" },
  { label: "منتظر کاربر", status: "WAITING_FOR_USER" },
  { label: "حل‌شده", status: "RESOLVED" },
  { label: "بسته", status: "CLOSED" },
];

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status =
    sp.status &&
    [
      "OPEN",
      "IN_PROGRESS",
      "WAITING_FOR_USER",
      "RESOLVED",
      "CLOSED",
    ].includes(sp.status)
      ? (sp.status as TicketStatus)
      : undefined;

  const tickets = await fetchAdminTickets({ status, q: sp.q });

  return (
    <section className="admin-page" aria-labelledby="admin-tickets-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">پشتیبانی</p>
          <h1 id="admin-tickets-heading" className="admin-page__title">
            تیکت‌ها
          </h1>
          <p className="admin-page__subtitle">
            فهرست و فیلتر — جزئیات و پاسخ در صفحهٔ تیکت.
          </p>
        </div>
        <form className="admin-search" method="get">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          <input
            type="search"
            name="q"
            placeholder="موضوع یا کاربر…"
            defaultValue={sp.q ?? ""}
          />
          <button type="submit">جستجو</button>
        </form>
      </header>

      <nav className="admin-filters" aria-label="فیلتر وضعیت">
        {FILTERS.map((f) => {
          const href = f.status
            ? `/admin/tickets?status=${f.status}`
            : "/admin/tickets";
          const current = (!status && !f.status) || status === f.status;
          return (
            <Link
              key={f.label}
              href={href}
              className={
                "admin-filters__link" +
                (current ? " admin-filters__link--current" : "")
              }
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      {tickets.length === 0 ? (
        <Notice tone="information" title="خالی">
          تیکتی با این فیلتر نیست.
        </Notice>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>موضوع</th>
                <th>کاربر</th>
                <th>وضعیت</th>
                <th>دوره</th>
                <th>به‌روز</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link
                      href={`/dashboard/tickets/${t.id}`}
                      className="admin-table__primary"
                    >
                      {t.subject}
                    </Link>
                  </td>
                  <td>{t.user?.displayName ?? "—"}</td>
                  <td>
                    <Badge status={ticketStatusBadge(t.status)}>
                      {ticketStatusLabel(t.status)}
                    </Badge>
                  </td>
                  <td>{t.course?.title ?? "—"}</td>
                  <td>{formatDateFa(t.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
