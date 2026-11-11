import Link from "next/link";
import { redirect } from "next/navigation";
import { DisinabBadge, DisinabPlate } from "../../../../../components/disinab";
import { TicketCreateForm } from "../../../../../components/ticket-create-form";
import { fetchCurrentUser } from "../../../../../lib/session";
import { fetchMySpotAccess } from "../../../../../lib/spotplayer";

export default async function NewTicketPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard/tickets/new");

  const access = await fetchMySpotAccess();
  const licenses = access?.items ?? [];

  const seen = new Set<string>();
  const courses = licenses.flatMap((lic) => {
    const slug = lic.course?.slug;
    const title = lic.course?.title;
    if (!slug || !title || seen.has(slug)) return [];
    seen.add(slug);
    return [{ slug, title }];
  });

  return (
    <div className="disinab-tickets">
      <DisinabPlate
        className="disinab-tickets__plate"
        aria-labelledby="new-ticket-heading"
      >
        <header className="disinab-tickets__head">
          <div>
            <h1 id="new-ticket-heading">تیکت جدید</h1>
            <p className="disinab__line">
              موضوع، شرح، و در صورت نیاز یکی از دوره‌های خودتان را انتخاب کنید.
            </p>
          </div>
          <div className="disinab-tickets__actions">
            <DisinabBadge tone="live">ثبت درخواست</DisinabBadge>
            <Link className="disinab-tickets__back" href="/dashboard/tickets">
              فهرست تیکت‌ها
            </Link>
            <Link className="disinab-tickets__back" href="/dashboard">
              بازگشت به حساب
            </Link>
          </div>
        </header>

        <TicketCreateForm courses={courses} />
      </DisinabPlate>
    </div>
  );
}
