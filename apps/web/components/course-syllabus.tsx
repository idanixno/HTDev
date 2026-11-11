"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { PublicCourseModule } from "../lib/catalog";
import { DisinabPlate } from "./disinab";
import { LessonWatch } from "./lesson-preview-player";

export function CourseSyllabus({
  modules,
  isFree,
  spotPlayerProtected,
  authed = false,
  loginHref,
}: {
  modules: PublicCourseModule[];
  isFree: boolean;
  spotPlayerProtected: boolean;
  /** Watch button only for signed-in visitors. */
  authed?: boolean;
  /** Login URL for free-course “ورود برای مشاهده”. */
  loginHref?: string;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(modules[0] ? [modules[0].id] : []),
  );

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const blurb = isFree
    ? authed
      ? "هر جلسه ویدیو دارد. با مشاهده همین‌جا پخش می‌شود؛ دانلود یکجا هم از کادر قیمت در دسترس است."
      : "سرفصل اینجاست. برای مشاهدهٔ ویدیوها وارد حساب شوید."
    : spotPlayerProtected
      ? "سرفصل دوره اینجاست. ویدیوهای اصلی بعد از خرید در اسپات‌پلیر پخش می‌شوند؛ اگر جلسه‌ای پیش‌نمایش داشته باشد، همان را همین‌جا می‌بینید."
      : "هر جلسه ویدیو دارد. با مشاهده همین‌جا پخش می‌شود.";

  return (
    <DisinabPlate
      className="syllabus disinab-course-syllabus"
      aria-labelledby="curriculum"
    >
      <header className="syllabus__head">
        <h2 id="curriculum">سرفصل</h2>
        <p className="disinab__line">{blurb}</p>
      </header>
      {modules.length === 0 ? (
        <p className="syllabus__empty">سرفصل هنوز منتشر نشده است.</p>
      ) : (
        <ol className="syllabus__modules">
          {modules.map((mod, moduleIndex) => {
            const open = openIds.has(mod.id);
            const panelId = `syllabus-panel-${mod.id}`;
            const buttonId = `syllabus-toggle-${mod.id}`;
            return (
              <li
                key={mod.id}
                className={open ? "is-open" : undefined}
                style={{ "--mod-i": moduleIndex } as CSSProperties}
              >
                <h3 className="syllabus__module-title">
                  <button
                    type="button"
                    id={buttonId}
                    className="syllabus__toggle"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(mod.id)}
                  >
                    <span className="syllabus__toggle-index" aria-hidden="true">
                      {(moduleIndex + 1).toLocaleString("fa-IR")}
                    </span>
                    <span className="syllabus__toggle-copy">
                      <span className="syllabus__toggle-name">{mod.title}</span>
                      <span className="syllabus__toggle-summary">
                        {mod.summary
                          ? mod.summary
                          : `${mod.lessons.length.toLocaleString("fa-IR")} درس`}
                      </span>
                    </span>
                    <span className="syllabus__chevron" aria-hidden="true" />
                  </button>
                </h3>
                <ol
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!open}
                >
                  {mod.lessons.map((lesson, lessonIndex) => (
                    <li key={lesson.id}>
                      <div className="syllabus__row">
                        <span className="syllabus__index">
                          {(lessonIndex + 1).toLocaleString("fa-IR")}
                        </span>
                        <div className="syllabus__main">
                          <div className="syllabus__heading">
                            <strong>{lesson.title}</strong>
                            {!isFree && lesson.isPreview ? (
                              <em>پیش‌نمایش</em>
                            ) : null}
                          </div>
                          <div className="syllabus__watch">
                            {lesson.durationMinutes != null ? (
                              <time>
                                {lesson.durationMinutes.toLocaleString("fa-IR")}{" "}
                                دقیقه
                              </time>
                            ) : null}
                            {authed && lesson.videoAsset ? (
                              <LessonWatch
                                src={lesson.videoAsset}
                                title={lesson.title}
                              />
                            ) : isFree && !authed && loginHref ? (
                              <Link
                                className="syllabus__login"
                                href={loginHref}
                              >
                                ورود برای مشاهده
                              </Link>
                            ) : spotPlayerProtected && !lesson.isPreview ? (
                              <span className="syllabus__spot">اسپات‌پلیر</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ol>
      )}
    </DisinabPlate>
  );
}
