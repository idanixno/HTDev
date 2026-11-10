import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CourseTrackTimeline,
  TrackOverviewCards,
} from "../../../../components/course-track-timeline";
import { DisinabPlate } from "../../../../components/disinab";
import { ownedCourseSlugs } from "../../../../lib/enrollment";
import { fetchMyRelevantTracks } from "../../../../lib/my-tracks";
import { buildTrackProgress } from "../../../../lib/track-progress";
import { fetchCurrentUser } from "../../../../lib/session";

export default async function DashboardTracksPage() {
  const user = await fetchCurrentUser();
  if (!user) redirect("/login?next=/dashboard/tracks");

  const owned = await ownedCourseSlugs();
  const tracks = await fetchMyRelevantTracks(owned);

  const activeCount = tracks.filter((t) => {
    const p = buildTrackProgress(t, owned);
    return p.done > 0 && !p.complete;
  }).length;

  return (
    <div className="folio salon-main disinab-tracks-page">
      <DisinabPlate
        className="disinab-tracks-page__hero"
        aria-labelledby="tracks-heading"
      >
        <p className="disinab__brand">مسیر تخصص</p>
        <h1 id="tracks-heading">تخصص‌های من</h1>
        <p className="disinab__line">
          فقط تخصص‌هایی که با دوره‌های خریداری‌شده یا رایگان فعال‌تان هم‌پوشانی
          دارند اینجا دیده می‌شوند.
        </p>
        {tracks.length > 0 ? (
          <p className="disinab-tracks-page__stat">
            {activeCount > 0
              ? `${activeCount.toLocaleString("fa-IR")} مسیر در حال پیشرفت`
              : `${tracks.length.toLocaleString("fa-IR")} تخصص فعال`}
          </p>
        ) : (
          <p className="disinab__line">
            هنوز تخصصی برای شما فعال نشده. با خرید یا دریافت یک دوره، مسیر مرتبط
            اینجا می‌آید.{" "}
            <Link href="/courses">مرور دوره‌ها</Link>
            {" · "}
            <Link href="/paths">نقشه‌های راه</Link>
          </p>
        )}
      </DisinabPlate>

      {tracks.length > 0 ? (
        <>
          <TrackOverviewCards tracks={tracks} ownedSlugs={owned} />
          <CourseTrackTimeline
            tracks={tracks}
            ownedSlugs={owned}
            context="dashboard"
          />
        </>
      ) : null}
    </div>
  );
}
