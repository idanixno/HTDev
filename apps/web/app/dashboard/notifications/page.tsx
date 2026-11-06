import Link from "next/link";
import { redirect } from "next/navigation";
import { NotificationsPanel } from "../../../components/notifications-panel";
import { fetchNotifications } from "../../../lib/notifications";
import { fetchCurrentUser } from "../../../lib/session";

export default async function NotificationsPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard/notifications");

  const data = await fetchNotifications();

  return (
    <section className="dashboard" aria-labelledby="notify-heading">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">اعلان‌ها</p>
          <h1 id="notify-heading" className="dashboard__title">
            صندوق اعلان‌ها
          </h1>
          <p className="dashboard__subtitle">
            اعلان‌های درون‌برنامه‌ای با وضعیت ارسال ایمیل/پیامک (کنسول در محیط
            توسعه).
          </p>
        </div>
        <Link href="/dashboard">بازگشت</Link>
      </header>

      <NotificationsPanel items={data.items} unreadCount={data.unreadCount} />
    </section>
  );
}
