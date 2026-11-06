import Link from "next/link";
import { redirect } from "next/navigation";
import { Notice } from "@zharfa/ui";
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
      <section className="dashboard">
        <Notice tone="error" title="یافت نشد">
          تیکت پیدا نشد یا به شما تعلق ندارد.{" "}
          <Link href="/dashboard/tickets">بازگشت</Link>
        </Notice>
      </section>
    );
  }

  return (
    <section className="dashboard">
      <p className="dashboard__eyebrow">
        <Link href="/dashboard/tickets">تیکت‌ها</Link>
      </p>
      <TicketThread ticket={ticket} isAdmin={user.role === "OWNER"} />
    </section>
  );
}
