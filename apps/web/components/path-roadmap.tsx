import Link from "next/link";
import type { CSSProperties } from "react";
import type { PublicPath, PublicPathStep } from "../lib/catalog";
import { formatCourseDurationClock, formatTomanLabel } from "../lib/catalog";
import { offerKindLabel } from "../lib/status-labels";
import { ArticleBody } from "./article-body";

function StepGoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M15 5 8 12l7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PathRoadmapTable({ steps }: { steps: PublicPathStep[] }) {
  if (steps.length === 0) return null;

  return (
    <ol className="disinab-roadmap__steps">
      {steps.map((step, index) => {
        const title = step.course?.title ?? step.title;
        const href = step.course?.href ?? step.href;
        const course = step.course;
        const offerChip = course
          ? course.offerKind === "PAID"
            ? "تکمیل ضبط"
            : course.offerKind === "FREE"
              ? null
              : offerKindLabel(course.offerKind)
          : null;
        const duration = course
          ? formatCourseDurationClock(course.durationHours)
          : null;
        const price =
          course?.offerKind === "FREE"
            ? "رایگان"
            : course?.offerKind === "COMING_SOON"
              ? null
              : course && course.priceToman > 0
                ? formatTomanLabel(course.priceToman)
                : (course?.priceLabel ?? null);
        const blurb = step.summary ?? course?.summary ?? null;
        const metaChip =
          offerChip && !(blurb && blurb.includes(offerChip)) ? offerChip : null;

        return (
          <li
            key={step.id}
            style={{ "--step-i": index } as CSSProperties}
          >
            <Link href={href} className="disinab-roadmap__step">
              <span className="disinab-roadmap__step-index" aria-hidden="true">
                {(index + 1).toLocaleString("fa-IR", {
                  minimumIntegerDigits: 2,
                })}
              </span>
              <span className="disinab-roadmap__step-body">
                <strong>{title}</strong>
                {blurb ? (
                  <span className="disinab-roadmap__step-summary">{blurb}</span>
                ) : null}
                {metaChip || duration || price ? (
                  <span className="disinab-roadmap__step-meta">
                    {metaChip ? <em>{metaChip}</em> : null}
                    {duration ? <em>{duration}</em> : null}
                    {price ? <em data-tone="price">{price}</em> : null}
                  </span>
                ) : null}
              </span>
              <span className="disinab-roadmap__step-go" aria-hidden="true">
                <StepGoIcon />
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function PathRoadmapSection({
  path,
  heading = "h2",
}: {
  path: PublicPath;
  heading?: "h1" | "h2";
}) {
  const Heading = heading;
  const steps = path.steps ?? [];
  const lead = path.description ?? path.summary;

  return (
    <section
      className="disinab-roadmap__section"
      aria-labelledby={`path-${path.slug}`}
    >
      <div className="disinab-roadmap__section-head">
        <Heading
          id={`path-${path.slug}`}
          className="disinab-roadmap__section-title"
        >
          {path.title}
        </Heading>
        {lead ? (
          <div className="disinab-roadmap__prose">
            <ArticleBody body={lead} />
          </div>
        ) : null}
        {path.summary &&
        path.description &&
        path.summary !== path.description ? (
          <p className="disinab-roadmap__prose disinab-roadmap__prose--secondary">
            {path.summary}
          </p>
        ) : null}
      </div>
      {steps.length > 0 ? <PathRoadmapTable steps={steps} /> : null}
    </section>
  );
}
