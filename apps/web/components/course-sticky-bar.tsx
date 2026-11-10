"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [away, setAway] = useState(false);

  useEffect(() => {
    const footer =
      document.querySelector<HTMLElement>(".site-footer") ??
      document.querySelector<HTMLElement>("footer");
    if (!footer) return;

    // Hide before the sticky covers footer chrome (taller Disinab plate).
    const lead = 280;

    function sync() {
      const top = footer!.getBoundingClientRect().top;
      setAway(top < window.innerHeight + lead);
    }

    sync();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setAway(entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight + lead);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `0px 0px ${lead}px 0px`,
      },
    );

    observer.observe(footer);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <div
      className={"course-sticky" + (away ? " is-away" : "")}
      role="region"
      aria-label="خرید سریع"
      aria-hidden={away || undefined}
      inert={away ? true : undefined}
    >
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
          <Link
            href={href}
            className="course-sticky__buy"
            tabIndex={away ? -1 : undefined}
          >
            {label}
          </Link>
        </div>
      </div>
    </div>
  );
}
