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
  priceLabel: ReactNode;
  compareAtLabel?: ReactNode;
  discountLabel?: ReactNode;
  statusLabel?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
};

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
  meta,
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

  const media = (
    <>
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
      {statusLabel ? (
        <span className="z-course-card__status">{statusLabel}</span>
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
        <h3 className="z-course-card__title">
          {href ? <a href={href}>{title}</a> : title}
        </h3>
        <p className="z-course-card__price-row">
          <span className="z-course-card__prices">
            <span className="z-course-card__price">{priceLabel}</span>
            {compareAtLabel ? (
              <s className="z-course-card__compare">{compareAtLabel}</s>
            ) : null}
          </span>
          {meta ? <span className="z-course-card__meta">{meta}</span> : null}
        </p>
        {action ? <div className="z-course-card__action">{action}</div> : null}
      </div>
    </article>
  );
}
