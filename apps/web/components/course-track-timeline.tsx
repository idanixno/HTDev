import Link from "next/link";
import { DisinabPlate } from "./disinab";
import type { PublicCourseTrack } from "../lib/catalog";
import { SHOW_TRACK_STACK } from "../lib/track-display";
import {
  buildTrackProgress,
  trackDisplayTitle,
  type TrackProgress,
  type TrackStepView,
} from "../lib/track-progress";

function ProgressMeter({
  progress,
  label,
}: {
  progress: TrackProgress;
  label: string;
}) {
  const pct = Math.round(progress.ratio * 100);
  return (
    <div className="disinab-track__meter" aria-label={label}>
      <div className="disinab-track__meter-head">
        <span>
          {progress.done.toLocaleString("fa-IR")} از{" "}
          {progress.total.toLocaleString("fa-IR")} گام
        </span>
        <span>{pct.toLocaleString("fa-IR")}٪</span>
      </div>
      <div
        className="disinab-track__meter-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function statusLabel(step: TrackStepView, context: "course" | "dashboard") {
  if (step.owned) return "طی‌شده";
  if (step.status === "here") {
    return context === "course" ? "همین دوره" : "قدم بعدی";
  }
  return "پیش رو";
}

function JourneyRail({
  progress,
  context,
}: {
  progress: TrackProgress;
  context: "course" | "dashboard";
}) {
  return (
    <ol className="disinab-track__rail">
      {progress.steps.map((item) => {
        if (!item.step.course && !item.step.title) return null;
        const course = item.step.course;
        const cover = course?.coverAsset ?? null;
        const price = course?.priceLabel ?? null;

        return (
          <li
            key={item.step.id}
            className="disinab-track__step"
            data-status={item.status}
            data-owned={item.owned || undefined}
          >
            <span className="disinab-track__node" aria-hidden="true">
              {item.owned ? (
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path
                    d="M5.5 12.5 10 17l8.5-9.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                (item.index + 1).toLocaleString("fa-IR")
              )}
            </span>
            <article className="disinab-track__card">
              <Link
                className="disinab-track__media"
                href={item.href}
                tabIndex={-1}
                aria-hidden="true"
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" />
                ) : (
                  <span className="disinab-track__media-fallback">DX</span>
                )}
              </Link>
              <div className="disinab-track__body">
                <p className="disinab-track__status">
                  {statusLabel(item, context)}
                </p>
                <h3>
                  <Link href={item.href}>{item.title}</Link>
                </h3>
                {item.focus ? (
                  <p className="disinab-track__focus">{item.focus}</p>
                ) : null}
                {price ? (
                  <p className="disinab-track__price">{price}</p>
                ) : null}
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

function NextAction({
  progress,
  pathHref,
  currentSlug,
  context,
}: {
  progress: TrackProgress;
  pathHref: string;
  currentSlug?: string | null;
  context: "course" | "dashboard";
}) {
  if (progress.complete) {
    return (
      <div className="disinab-track__cta">
        <p className="disinab-track__cta-kicker">مسیر کامل شد</p>
        <p className="disinab-track__cta-title">
          همهٔ گام‌های این تخصص را دارید.
        </p>
        <Link className="z-btn z-btn--secondary disinab-track__cta-btn" href={pathHref}>
          نقشهٔ کامل مسیر
        </Link>
      </div>
    );
  }

  const nextAway =
    currentSlug != null
      ? progress.remainingSteps.find(
          (step) => step.step.course?.slug !== currentSlug,
        ) ?? null
      : progress.next;

  // On the course page, don't advertise "next" as the page you're already on.
  if (context === "course" && currentSlug) {
    if (nextAway) {
      return (
        <div className="disinab-track__cta">
          <p className="disinab-track__cta-kicker">بعد از این دوره</p>
          <p className="disinab-track__cta-title">{nextAway.title}</p>
          <div className="disinab-track__cta-actions">
            <Link className="z-btn disinab-track__cta-btn" href={nextAway.href}>
              برو به دورهٔ بعدی
            </Link>
            <Link className="disinab-track__cta-quiet" href={pathHref}>
              نقشهٔ کامل مسیر
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="disinab-track__cta">
        <p className="disinab-track__cta-kicker">ایستگاه فعلی</p>
        <p className="disinab-track__cta-title">
          همین دوره آخرین گام ماندهٔ این تخصص است.
        </p>
        <Link className="z-btn z-btn--secondary disinab-track__cta-btn" href={pathHref}>
          نقشهٔ کامل مسیر
        </Link>
      </div>
    );
  }

  if (!progress.next) return null;
  return (
    <div className="disinab-track__cta">
      <p className="disinab-track__cta-kicker">قدم بعدی</p>
      <p className="disinab-track__cta-title">{progress.next.title}</p>
      <div className="disinab-track__cta-actions">
        <Link className="z-btn disinab-track__cta-btn" href={progress.next.href}>
          ادامهٔ مسیر
        </Link>
        <Link className="disinab-track__cta-quiet" href={pathHref}>
          نقشهٔ کامل مسیر
        </Link>
      </div>
    </div>
  );
}

function CourseTrackBlock({
  track,
  owned,
  context,
}: {
  track: PublicCourseTrack;
  owned: Set<string>;
  context: "course" | "dashboard";
}) {
  const anchor =
    context === "course" ? track.currentCourseSlug : null;
  const progress = buildTrackProgress(track, owned, anchor);
  const title = trackDisplayTitle(track);

  if (context === "course") {
    return (
      <DisinabPlate
        className="disinab-track disinab-track--course"
        aria-labelledby={`track-${track.slug}`}
      >
        <header className="disinab-track__head">
          <div className="disinab-track__intro">
            <h2 id={`track-${track.slug}`}>{title}</h2>
            <p className="disinab__line">
              این دوره یک ایستگاه از مسیر منسجم «{title}» است — نه یک قطعهٔ
              جدا.
            </p>
          </div>
          <ProgressMeter
            progress={progress}
            label={`پیشرفت مسیر ${title}`}
          />
        </header>

        <JourneyRail progress={progress} context="course" />

        <footer className="disinab-track__foot">
          <NextAction
            progress={progress}
            pathHref={track.href}
            currentSlug={track.currentCourseSlug}
            context="course"
          />
        </footer>
      </DisinabPlate>
    );
  }

  return (
    <DisinabPlate
      className="disinab-track disinab-track--dashboard"
      aria-labelledby={`track-dash-${track.slug}`}
    >
      <header className="disinab-track__head">
        <div className="disinab-track__intro">
          <h2 id={`track-dash-${track.slug}`}>{title}</h2>
          {track.summary ? (
            <p className="disinab__line">{track.summary}</p>
          ) : (
            <p className="disinab__line">
              گام‌های طی‌شده و مانده را ببینید؛ قدم بعدی همیشه مشخص است.
            </p>
          )}
        </div>
        <ProgressMeter progress={progress} label={`پیشرفت ${title}`} />
      </header>

      <div className="disinab-track__split">
        <section className="disinab-track__milestones" aria-label="گام‌های طی‌شده">
          <h3>طی‌شده</h3>
          {progress.doneSteps.length === 0 ? (
            <p className="disinab-track__empty">هنوز گامی طی نشده.</p>
          ) : (
            <ul>
              {progress.doneSteps.map((item) => (
                <li key={item.step.id}>
                  <Link href={item.href}>{item.title}</Link>
                  {item.focus ? <span>{item.focus}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="disinab-track__milestones" aria-label="گام‌های مانده">
          <h3>مانده</h3>
          {progress.remainingSteps.length === 0 ? (
            <p className="disinab-track__empty">مسیر کامل است.</p>
          ) : (
            <ul>
              {progress.remainingSteps.map((item) => (
                <li key={item.step.id} data-here={item.status === "here" || undefined}>
                  <Link href={item.href}>{item.title}</Link>
                  {item.focus ? <span>{item.focus}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <JourneyRail progress={progress} context="dashboard" />

      <footer className="disinab-track__foot">
        <NextAction
          progress={progress}
          pathHref={track.href}
          context="dashboard"
        />
      </footer>
    </DisinabPlate>
  );
}

export function CourseTrackTimeline({
  tracks,
  ownedSlugs,
  context = "course",
}: {
  tracks: PublicCourseTrack[];
  ownedSlugs?: Set<string>;
  context?: "course" | "dashboard";
}) {
  if (!SHOW_TRACK_STACK) return null;
  if (tracks.length === 0) return null;
  const owned = ownedSlugs ?? new Set<string>();

  // On course page keep signal calm: one primary track, others as quiet links.
  if (context === "course" && tracks.length > 1) {
    const [primary, ...rest] = tracks;
    return (
      <div className="disinab-track-stack">
        <CourseTrackBlock track={primary!} owned={owned} context="course" />
        <nav className="disinab-track__alts" aria-label="مسیرهای مرتبط دیگر">
          <p>مسیرهای مرتبط دیگر</p>
          <ul>
            {rest.map((track) => (
              <li key={track.id}>
                <Link href={track.href}>{trackDisplayTitle(track)}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <div className="disinab-track-stack">
      {tracks.map((track) => (
        <CourseTrackBlock
          key={track.id}
          track={track}
          owned={owned}
          context={context}
        />
      ))}
    </div>
  );
}

export function TrackOverviewCards({
  tracks,
  ownedSlugs,
}: {
  tracks: PublicCourseTrack[];
  ownedSlugs: Set<string>;
}) {
  if (!SHOW_TRACK_STACK) return null;
  if (tracks.length === 0) return null;

  return (
    <ul className="disinab-tracks-overview">
      {tracks.map((track) => {
        const progress = buildTrackProgress(track, ownedSlugs);
        const title = trackDisplayTitle(track);
        const pct = Math.round(progress.ratio * 100);
        return (
          <li key={track.id}>
            <Link
              className="disinab-tracks-overview__card"
              href={`#track-dash-${track.slug}`}
            >
              <div className="disinab-tracks-overview__top">
                <strong>{title}</strong>
                <span>
                  {progress.complete
                    ? "کامل"
                    : `${pct.toLocaleString("fa-IR")}٪`}
                </span>
              </div>
              <div
                className="disinab-track__meter-track"
                aria-hidden="true"
              >
                <span style={{ width: `${pct}%` }} />
              </div>
              <p>
                {progress.complete
                  ? "مسیر تخصص کامل شده"
                  : progress.next
                    ? `قدم بعدی: ${progress.next.title}`
                    : `${progress.remaining.toLocaleString("fa-IR")} گام مانده`}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
