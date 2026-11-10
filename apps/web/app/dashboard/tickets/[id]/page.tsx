import Link from "next/link";
import { redirect } from "next/navigation";
import { Notice } from "@zharfa/ui";
import { DisinabBadge, DisinabPlate } from "../../../../components/disinab";
import { TicketThread } from "../../../../components/ticket-thread";
import { fetchCurrentUser } from "../../../../lib/session";
import { fetchTicket } from "../../../../lib/tickets";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await fetchCurrentUser();
  const { id } = await params;
  if (!user) redirect(`/login?next=/dashboard/tickets/${id}`);

  const ticket = await fetchTicket(id);
  if (!ticket) {
    return (
      <div className="disinab-tickets">
        <DisinabPlate className="disinab-tickets__plate" aura={false}>
          <Notice tone="error" title="یافت نشد">
            تیکت پیدا نشد یا به شما تعلق ندارد.{" "}
            <Link href="/dashboard/tickets">بازگشت به فهرست تیکت‌ها</Link>
          </Notice>
        </DisinabPlate>
      </div>
    );
  }

  return (
    <div className="disinab-tickets">
      <DisinabPlate
        className="disinab-tickets__plate disinab-tickets__plate--thread"
        aria-labelledby="ticket-thread-heading"
      >
        <header className="disinab-tickets__crumb">
          <DisinabBadge tone="accent">رشتهٔ تیکت</DisinabBadge>
          <nav className="crumbs disinab-tickets__crumbs" aria-label="مسیر">
            <Link href="/dashboard">حساب من</Link>
            <span aria-hidden="true">/</span>
            <Link href="/dashboard/tickets">تیکت‌ها</Link>
            <span aria-hidden="true">/</span>
            <span>گفتگو</span>
          </nav>
        </header>
        <h1 id="ticket-thread-heading" className="visually-hidden">
          {ticket.subject}
        </h1>
        <TicketThread ticket={ticket} isAdmin={user.role === "OWNER"} />
      </DisinabPlate>
    </div>
  );
}
