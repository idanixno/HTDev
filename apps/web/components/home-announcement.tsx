import Link from "next/link";
import type { HomeAnnouncement } from "../lib/catalog";

export function HomeAnnouncementBanner({
  announcement,
}: {
  announcement: HomeAnnouncement;
}) {
  if (!announcement.enabled) return null;

  const body = (
    <>
      <p className="home-announcement__text">{announcement.text}</p>
      {announcement.href ? (
        <span className="home-announcement__cta">
          {announcement.ctaLabel || "ادامه"}
        </span>
      ) : null}
    </>
  );

  return (
    <aside className="home-announcement disinab-home-announcement" aria-label="اطلاعیه">
      {announcement.href ? (
        <Link
          className="home-announcement__plate disinab-home-announcement__plate"
          href={announcement.href}
        >
          {body}
        </Link>
      ) : (
        <div className="home-announcement__plate disinab-home-announcement__plate">
          {body}
        </div>
      )}
    </aside>
  );
}
