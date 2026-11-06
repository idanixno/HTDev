import type { HTMLAttributes, ReactNode } from "react";

export type CourseAvailability =
  | "publishedPaid"
  | "publishedFree"
  | "preorder"
  | "inProduction"
  | "comingSoon"
  | "unavailable";

type DiagramKind = "boundary" | "chain";

export type CourseCardProps = HTMLAttributes<HTMLElement> & {
  availability?: CourseAvailability;
  indexLabel?: string;
  diagramCode?: string;
  diagramKind?: DiagramKind;
  chainNodes?: [string, string, string];
  statusLabel?: string;
  title: ReactNode;
  summary: ReactNode;
  meta?: ReactNode;
  priceLabel: ReactNode;
  ctaLabel?: ReactNode;
  href?: string;
};

const STATUS_DEFAULTS: Record<CourseAvailability, string> = {
  publishedPaid: "منتشرشده",
  publishedFree: "منتشرشده",
  preorder: "پیش‌فروش · تاریخ در انتظار تأیید",
  inProduction: "در حال تولید",
  comingSoon: "به‌زودی",
  unavailable: "موقتاً ناموجود",
};

const CTA_DEFAULTS: Record<CourseAvailability, string> = {
  publishedPaid: "مشاهده دوره ←",
  publishedFree: "مشاهده دوره ←",
  preorder: "مشاهده دوره ←",
  inProduction: "مشاهده وضعیت ←",
  comingSoon: "مشاهده وضعیت ←",
  unavailable: "مشاهده وضعیت ←",
};

export function CourseCard({
  availability = "publishedPaid",
  indexLabel = "۰۱",
  diagramCode = "BOUNDARY / ۰۱",
  diagramKind,
  chainNodes = ["USER / SHELL", "KERNEL", "HARDWARE"],
  statusLabel,
  title,
  summary,
  meta,
  priceLabel,
  ctaLabel,
  href = "#",
  className,
  ...rest
}: CourseCardProps) {
  const kind =
    diagramKind ?? (availability === "publishedPaid" ? "boundary" : "chain");
  const classes = [
    "z-course-card",
    `z-course-card--${availability}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes} {...rest}>
      <div className="z-course-card__visual" aria-hidden="true">
        <div className="z-course-card__visual-head">
          <p className="z-course-card__code">{diagramCode}</p>
          <p className="z-course-card__index">{indexLabel}</p>
        </div>
        {kind === "boundary" ? (
          <div className="z-course-card__diagram">
            <div className="z-course-card__ring">
              <div className="z-course-card__core">DOMAIN ←</div>
            </div>
          </div>
        ) : (
          <div className="z-course-card__chain">
            {chainNodes.map((label, i) => (
              <div
                key={`${label}-${i}`}
                className={[
                  "z-course-card__node",
                  i === 1 ? "z-course-card__node--accent" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <p className="z-course-card__node-order">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="z-course-card__node-label">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="z-course-card__body">
        <p className="z-course-card__status">
          {statusLabel ?? STATUS_DEFAULTS[availability]}
        </p>
        <h3 className="z-course-card__title">{title}</h3>
        <p className="z-course-card__summary">{summary}</p>
        {meta ? <p className="z-course-card__meta">{meta}</p> : null}
        <hr className="z-course-card__divider" />
        <p className="z-course-card__price">{priceLabel}</p>
        <p className="z-course-card__cta">
          <a href={href}>{ctaLabel ?? CTA_DEFAULTS[availability]}</a>
        </p>
      </div>
    </article>
  );
}
