import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Button, Notice } from "@zharfa/ui";
import { fetchCurrentUser } from "../../../lib/session";
import {
  fetchMyTickets,
  ticketStatusBadge,
  ticketStatusLabel,
} from "../../../lib/tickets";

export default async function TicketsPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard/tickets");

  const tickets = await fetchMyTickets();

  return (
    <section className="dashboard" aria-labelledby="tickets-heading">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">پشتیبانی</p>
          <h1 id="tickets-heading" className="dashboard__title">
            تیکت‌های من
          </h1>
          <p className="dashboard__subtitle">
            پشتیبانی داخلی ژرفا — گفتگو، وضعیت و پیوست‌های امن.
          </p>
        </div>
        <div className="dashboard__actions">
          <Button href="/dashboard/tickets/new" variant="primary">
            تیکت جدید
          </Button>
          <Link href="/dashboard">بازگشت</Link>
        </div>
      </header>

      {tickets.length === 0 ? (
        <Notice tone="information" title="تیکتی نیست">
          هنوز تیکتی ثبت نکرده‌اید. از{" "}
          <Link href="/dashboard/tickets/new">فرم تیکت جدید</Link> شروع کنید.
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
