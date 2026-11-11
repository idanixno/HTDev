"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CourseCardLink } from "./course-card-link";
import type { PublicCourseCard } from "../lib/catalog";

const INTERVAL_MS = 4200;

export function DisinabCourseCarousel({
  courses,
  ariaLabel = "دوره‌های پیشنهادی",
  ownedSlugs = [],
}: {
  courses: PublicCourseCard[];
  ariaLabel?: string;
  ownedSlugs?: string[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const inViewRef = useRef(true);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const count = courses.length;

  const scrollToIndex = useCallback(
    (next: number) => {
      const root = scrollerRef.current;
      if (!root || count < 1) return;
      const items = root.querySelectorAll<HTMLElement>("[data-carousel-item]");
      if (items.length === 0) return;
      const safe = ((next % items.length) + items.length) % items.length;
      const target = items[safe];
      if (!target) return;

      // Only scroll the horizontal scroller — never the document
      // (scrollIntoView was yanking the page while reading the syllabus).
      const rootBox = root.getBoundingClientRect();
      const itemBox = target.getBoundingClientRect();
      const rtl = getComputedStyle(root).direction === "rtl";
      const delta = rtl
        ? itemBox.right - rootBox.right
        : itemBox.left - rootBox.left;
      root.scrollBy({ left: delta, behavior: "smooth" });
      indexRef.current = safe;
      setIndex(safe);
    },
    [count],
  );

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || count < 2) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = Boolean(entry?.isIntersecting);
      },
      { root: null, threshold: 0.2 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (pausedRef.current || !inViewRef.current) return;
      scrollToIndex(indexRef.current + 1);
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [count, scrollToIndex]);

  if (count === 0) return null;

  return (
    <div
      className="disinab-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        ref={scrollerRef}
        className="disinab-carousel__scroller"
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        <ul className="disinab-carousel__list">
          {courses.map((course, i) => (
            <li
              key={course.id}
              className="disinab-carousel__item"
              data-carousel-item=""
              aria-label={`${(i + 1).toLocaleString("fa-IR")} از ${count.toLocaleString("fa-IR")}`}
            >
              <CourseCardLink
                course={course}
                enrolled={ownedSlugs.includes(course.slug)}
              />
            </li>
          ))}
        </ul>
      </div>

      {count > 1 ? (
        <div className="disinab-carousel__controls">
          <button
            type="button"
            className="disinab-carousel__btn"
            onClick={() => scrollToIndex(index - 1)}
            aria-label="قبلی"
          >
            قبلی
          </button>
          <p className="disinab-carousel__dots" aria-hidden="true">
            {Array.from({ length: count }, (_, i) => (
              <span
                key={i}
                className={
                  "disinab-carousel__dot" + (i === index ? " is-active" : "")
                }
              />
            ))}
          </p>
          <button
            type="button"
            className="disinab-carousel__btn"
            onClick={() => scrollToIndex(index + 1)}
            aria-label="بعدی"
          >
            بعدی
          </button>
        </div>
      ) : null}
    </div>
  );
}
