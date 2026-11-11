import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge, Button, Notice } from "@zharfa/ui";
import { DisinabBadge, DisinabPlate } from "../../../../components/disinab";
import {
  fetchMyTickets,
  ticketStatusBadge,
  ticketStatusLabel,
} from "../../../../lib/tickets";
import { fetchCurrentUser } from "../../../../lib/session";

export default async function TicketsPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard/tickets");

  const tickets = await fetchMyTickets();

  return (
    <div className="disinab-tickets">
      <DisinabPlate
        className="disinab-tickets__plate"
        aria-labelledby="tickets-heading"
      >
        <header className="disinab-tickets__head">
          <div>
            <h1 id="tickets-heading">تیکت‌های من</h1>
            <p className="disinab__line">
              گفتگو با تیم{" "}
              <span className="dx-wordmark dx-wordmark--inline">DXCode</span>؛ هر
              تیکت یک رشتهٔ پیگیری جدا است.
            </p>
          </div>
          <div className="disinab-tickets__actions">
            <DisinabBadge tone="accent">سیستم تیکت</DisinabBadge>
            <Button href="/dashboard/tickets/new">تیکت جدید</Button>
            <Link className="disinab-tickets__back" href="/dashboard">
              بازگشت به حساب
            </Link>
          </div>
        </header>

        {tickets.length === 0 ? (
          <Notice tone="information" title="تیکتی نیست">
            هنوز گفتگویی باز نشده. برای شروع یک{" "}
            <Link href="/dashboard/tickets/new">تیکت جدید</Link> بسازید.
          </Notice>
        ) : (
          <ul className="disinab-tickets__list">
            {tickets.map((ticket) => (
              <li key={ticket.id} className="disinab-tickets__item">
                <div>
                  <h2>
                    <Link href={`/dashboard/tickets/${ticket.id}`}>
                      {ticket.subject}
                    </Link>
                  </h2>
                  <p>
                    {ticket.course ? `${ticket.course.title} · ` : null}
                    {new Date(ticket.updatedAt).toLocaleString("fa-IR")}
                  </p>
                </div>
                <Badge status={ticketStatusBadge(ticket.status)}>
                  {ticketStatusLabel(ticket.status)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </DisinabPlate>
    </div>
  );
}
