import type { HTMLAttributes, ReactNode } from "react";

export type CourseAvailability =
  | "publishedPaid"
  | "publishedFree"
  | "preorder"
  | "inProduction"
  | "comingSoon"
  | "unavailable";

export type CourseCardProps = HTMLAttributes<HTMLElement> & {
  availability?: CourseAvailability;
  title: ReactNode;
  href?: string;
  coverSrc?: string;
  coverAlt?: string;
  priceLabel?: ReactNode;
  compareAtLabel?: ReactNode;
  discountLabel?: ReactNode;
  /** Recording / offer status shown in the body meta row. */
  statusLabel?: ReactNode;
  /** Secondary meta (instructor / category) opposite the status. */
  byline?: ReactNode;
  /** Duration shown with a clock in the foot row. */
  durationLabel?: ReactNode;
  action?: ReactNode;
};

function ClockIcon() {
  return (
    <svg
      className="z-course-card__clock"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 8.25V12l2.75 1.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusCheck() {
  return (
    <svg
      className="z-course-card__check"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
    >
      <path
        d="M5.5 12.5 10 17l8.5-9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CourseCard({
  availability = "publishedPaid",
  title,
  href,
  coverSrc,
  coverAlt = "",
  priceLabel,
  compareAtLabel,
  discountLabel,
  statusLabel,
  byline,
  durationLabel,
  action,
  className,
  ...rest
}: CourseCardProps) {
  const classes = [
    "z-course-card",
    `z-course-card--${availability}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const showCheck =
    availability === "publishedPaid" || availability === "publishedFree";

  const media = (
    <>
      <span className="z-course-card__media-frame" aria-hidden="true" />
      {coverSrc ? (
        <img src={coverSrc} alt={coverAlt} />
      ) : (
        <span className="z-course-card__placeholder" aria-hidden="true">
          بدون تصویر
        </span>
      )}
      {discountLabel ? (
        <span className="z-course-card__discount">{discountLabel}</span>
      ) : null}
    </>
  );

  return (
    <article className={classes} {...rest}>
      {href ? (
        <a className="z-course-card__media" href={href}>
          {media}
        </a>
      ) : (
        <div className="z-course-card__media">{media}</div>
      )}
      <div className="z-course-card__body">
        <div className="z-course-card__heading">
          <h3 className="z-course-card__title">
            {href ? <a href={href}>{title}</a> : title}
          </h3>

          {statusLabel || byline ? (
            <div className="z-course-card__meta-row">
              {statusLabel ? (
                <span className="z-course-card__status-inline">
                  {showCheck ? <StatusCheck /> : null}
                  {statusLabel}
                </span>
              ) : null}
              {byline ? (
                <span className="z-course-card__byline">{byline}</span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="z-course-card__foot">
          {durationLabel ? (
            <span className="z-course-card__duration">
              <ClockIcon />
              {durationLabel}
            </span>
          ) : (
            <span className="z-course-card__duration z-course-card__duration--empty" />
          )}
          {priceLabel ? (
            <p className="z-course-card__prices">
              <span className="z-course-card__price">{priceLabel}</span>
              {compareAtLabel ? (
                <s className="z-course-card__compare">{compareAtLabel}</s>
              ) : null}
            </p>
          ) : null}
        </div>

        {action ? <div className="z-course-card__action">{action}</div> : null}
      </div>
    </article>
  );
}
