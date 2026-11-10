"use client";

import Link from "next/link";

type Props = {
  title: string;
  priceLabel: string;
  href: string;
  label: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

/** Bottom nav-style CTA so purchase stays one tap away while reading the syllabus. */
export function CourseStickyBar({
  title,
  priceLabel,
  href,
  label,
  secondaryHref,
  secondaryLabel,
}: Props) {
  return (
    <div className="course-sticky" role="region" aria-label="خرید سریع">
      <div className="course-sticky__inner">
        <div className="course-sticky__copy">
          <p className="course-sticky__title">{title}</p>
          <p className="course-sticky__price">{priceLabel}</p>
        </div>
        <div className="course-sticky__actions">
          {secondaryHref && secondaryLabel ? (
            <Link href={secondaryHref} className="course-sticky__ghost">
              {secondaryLabel}
            </Link>
          ) : null}
          <Link href={href} className="course-sticky__buy">
            {label}
          </Link>
        </div>
      </div>
    </div>
  );
}
