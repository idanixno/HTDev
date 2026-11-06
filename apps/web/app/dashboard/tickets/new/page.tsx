import Link from "next/link";
import { redirect } from "next/navigation";
import { TicketCreateForm } from "../../../../components/ticket-create-form";
import { fetchCourses } from "../../../../lib/catalog";
import { fetchCurrentUser } from "../../../../lib/session";

export default async function NewTicketPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard/tickets/new");

  const catalog = await fetchCourses({ pageSize: 50 });
  const courses = catalog.items.map((c) => ({
    slug: c.slug,
    title: c.title,
  }));

  return (
    <section className="dashboard" aria-labelledby="new-ticket-heading">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">پشتیبانی</p>
          <h1 id="new-ticket-heading" className="dashboard__title">
            تیکت جدید
          </h1>
          <p className="dashboard__subtitle">
            موضوع، شرح، و در صورت نیاز لینک دوره را وارد کنید.
          </p>
        </div>
        <Link href="/dashboard/tickets">بازگشت به فهرست</Link>
      </header>

      <TicketCreateForm courses={courses} />
    </section>
  );
}
