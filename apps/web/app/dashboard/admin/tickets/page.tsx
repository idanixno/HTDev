import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Notice } from "@zharfa/ui";
import { fetchCurrentUser } from "../../../../lib/session";
import {
  fetchAdminTickets,
  ticketStatusBadge,
  ticketStatusLabel,
  type TicketStatus,
} from "../../../../lib/tickets";

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
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard/admin/tickets");
  if (user.role !== "OWNER") redirect("/dashboard");

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
    <section className="dashboard" aria-labelledby="admin-tickets-heading">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">ادمین</p>
          <h1 id="admin-tickets-heading" className="dashboard__title">
            تیکت‌های پشتیبانی
          </h1>
          <p className="dashboard__subtitle">
            فهرست، فیلتر وضعیت، و پاسخ به دانشجویان.
          </p>
        </div>
        <Link href="/dashboard">بازگشت</Link>
      </header>

      <nav className="ticket-filters" aria-label="فیلتر وضعیت">
        {FILTERS.map((f) => {
          const href = f.status
            ? `/dashboard/admin/tickets?status=${f.status}`
            : "/dashboard/admin/tickets";
          const current = (!status && !f.status) || status === f.status;
          return (
            <Link
              key={f.label}
              href={href}
              className={
                "ticket-filters__link" +
                (current ? " ticket-filters__link--current" : "")
              }
            >
              {f.label}
            </Link>
          );
        })}
      </nav>

      <form className="ticket-search" method="get">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <label htmlFor="ticket-q">جستجو</label>
        <input
          id="ticket-q"
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="موضوع، شرح، یا نام کاربری"
        />
        <button type="submit">بگرد</button>
      </form>

      {tickets.length === 0 ? (
        <Notice tone="information" title="موردی نیست">
          تیکتی با این فیلتر یافت نشد.
        </Notice>
      ) : (
        <ul className="ticket-list">
          {tickets.map((t) => (
            <li key={t.id} className="ticket-list__item">
              <div>
                <h2>
                  <Link href={`/dashboard/tickets/${t.id}`}>{t.subject}</Link>
                </h2>
                <p className="ticket-list__meta">
                  {t.user?.displayName ?? t.user?.username} ·{" "}
                  {t.course ? `${t.course.title} · ` : null}
                  {new Date(t.updatedAt).toLocaleString("fa-IR")}
                </p>
              </div>
              <Badge status={ticketStatusBadge(t.status)}>
                {ticketStatusLabel(t.status)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
