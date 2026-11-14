import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@zharfa/ui";
import { CourseDescription } from "../../../../components/course-description";
import { ArticleCard } from "../../../../components/article-card";
import { CourseStickyBar } from "../../../../components/course-sticky-bar";
import { CourseSyllabus } from "../../../../components/course-syllabus";
import { CourseFreeEnrollment } from "../../../../components/course-free-enrollment";
import { CourseWaitlistForm } from "../../../../components/course-waitlist-form";
import { CoursePurchaseNoteBody } from "../../../../components/course-purchase-note-body";
import {
  DisinabBadge,
  DisinabFacts,
  DisinabPlate,
} from "../../../../components/disinab";
import { CourseTrackTimeline } from "../../../../components/course-track-timeline";
import { DisinabCourseCarousel } from "../../../../components/disinab-course-carousel";
import {
  courseDiscount,
  formatCourseDuration,
  fetchCourse,
  fetchCourseTracks,
  fetchCourses,
  fetchRelatedArticles,
} from "../../../../lib/catalog";
import { absoluteUrl } from "../../../../lib/site-url";
import { fetchCheckoutOptions } from "../../../../lib/commerce";
import { ownedCourseSlugs, userOwnsCourse } from "../../../../lib/enrollment";
import { buildPageMetadata } from "../../../../lib/seo";
import { fetchCurrentUser } from "../../../../lib/session";
import {
  breadcrumbJsonLd,
  courseJsonLd,
} from "../../../../lib/structured-data";
import { SHOW_TRACK_STACK } from "../../../../lib/track-display";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course) {
    return buildPageMetadata({
      title: "دوره یافت نشد",
      description: "این دوره در کاتالوگ DXCode موجود نیست.",
      path: `/courses/${slug}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: course.seoTitle || course.title,
    description:
      course.seoDescription ||
      course.summary ||
      course.description ||
      course.title,
    path: course.href,
    imagePath: course.ogImage || course.coverAsset,
    noIndex: Boolean(course.noIndex),
  });
}

export default async function CourseDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course) notFound();

  const user = await fetchCurrentUser();
  const enrolled = user ? await userOwnsCourse(slug) : false;
  const [related, relatedArticles, tracks, owned] = await Promise.all([
    course.category
      ? fetchCourses({
          category: course.category.slug,
          pageSize: 12,
        }).then((result) =>
          result.items
            .filter((item) => item.slug !== course.slug)
            .slice(0, 8),
        )
      : Promise.resolve([]),
    fetchRelatedArticles(slug),
    SHOW_TRACK_STACK
      ? fetchCourseTracks(slug)
      : Promise.resolve([]),
    user ? ownedCourseSlugs() : Promise.resolve(new Set<string>()),
  ]);
  const isFree = course.offerKind === "FREE";
  const shareImage = course.ogImage || course.coverAsset;
  const jsonLd = courseJsonLd({
    name: course.seoTitle || course.title,
    description:
      course.seoDescription ||
      course.summary ||
      course.description ||
      course.title,
    url: absoluteUrl(course.href),
    image: shareImage
      ? shareImage.startsWith("http")
        ? shareImage
        : absoluteUrl(shareImage)
      : null,
    instructorName: course.instructorName,
  });
  const crumbsLd = breadcrumbJsonLd([
    { name: "خانه", path: "/" },
    { name: "دوره‌ها", path: "/courses" },
    { name: course.title, path: course.href },
  ]);
  const isPaidOffer =
    course.offerKind === "PAID" || course.offerKind === "PRE_SALE";
  const checkout = isPaidOffer ? await fetchCheckoutOptions(slug) : null;
  const purchaseEnabled = Boolean(checkout?.purchaseEnabled);
  const purchaseHref = user
    ? `/courses/${slug}/purchase`
    : `/login?next=/courses/${encodeURIComponent(slug)}/purchase`;
  const discount = courseDiscount(course);
  const offerTone =
    course.offerKind === "FREE"
      ? "free"
      : course.offerKind === "PRE_SALE"
        ? "presale"
        : course.offerKind === "COMING_SOON"
          ? "soon"
          : "sale";

  const sticky = enrolled
    ? {
        href: "/dashboard#courses",
        label: "مشاهده در حساب من",
        priceLabel: "شما دانشجوی این دوره هستید",
      }
    : isFree
      ? {
          href: user
            ? "#course-buy"
            : `/login?next=/courses/${encodeURIComponent(slug)}`,
          label: user
            ? "ثبت‌نام در دوره"
            : "دسترسی رایگان با ورود",
          priceLabel: "رایگان",
        }
      : isPaidOffer
        ? purchaseEnabled
          ? {
              href: purchaseHref,
              label: user ? "ثبت‌نام در این دوره" : "ورود و ثبت‌نام",
              priceLabel: course.priceLabel,
            }
          : {
              href: "#course-buy",
              label: "مشاهده دوره",
              priceLabel: course.priceLabel,
            }
        : {
            href: "#course-buy",
            label: "پیش‌ثبت‌نام",
            priceLabel: course.priceLabel,
          };

  const buyFacts = [
    ...(course.instructorName
      ? [{ label: "مدرس", value: course.instructorName }]
      : []),
    ...(formatCourseDuration(course.durationHours)
      ? [
          {
            label: "مدت",
            value: formatCourseDuration(course.durationHours)!,
          },
        ]
      : []),
    ...(course.levelLabel
      ? [{ label: "سطح", value: course.levelLabel }]
      : []),
    {
      label: "درس",
      value: course.lessonCount.toLocaleString("fa-IR"),
    },
    {
      label: "وضعیت",
      value: (
        <strong className="course-status">{course.statusLabel}</strong>
      ),
    },
    ...(!enrolled
      ? [
          {
            label: "قیمت",
            value: (
              <span className="course-detail__price course-detail__price--fact">
                <span>{course.priceLabel}</span>
                {discount ? (
                  <>
                    <s>{discount.compareLabel}</s>
                    <em>{discount.badge}</em>
                  </>
                ) : null}
              </span>
            ),
          },
        ]
      : []),
  ];

  const buyBox = (
    <DisinabPlate
      as="aside"
      id="course-buy"
      className={
        enrolled
          ? "course-buy disinab-course-buy course-buy--owned"
          : "course-buy disinab-course-buy"
      }
      aria-labelledby="course-title"
    >
      <h1 id="course-title" className="disinab-course-buy__title">
        {course.title}
      </h1>
      {course.summary ? (
        <p className="disinab__line disinab-course-buy__lead">{course.summary}</p>
      ) : null}
      {enrolled ? (
        <div className="course-enrolled">
          <p className="course-enrolled__title">شما دانشجوی این دوره هستید.</p>
          <p className="disinab__line">
            {isFree
              ? "ویدیوها را همین‌جا مشاهده کنید یا یکجا دانلود بگیرید."
              : "کلید لایسنس در حساب شماست و خرید دوباره لازم نیست."}
          </p>
        </div>
      ) : null}
      <DisinabFacts items={buyFacts} />
      {enrolled ? (
        <div className="course-detail__actions disinab-course-buy__actions">
          <Button href="/dashboard#courses" variant="secondary">
            مشاهده در حساب من
          </Button>
        </div>
      ) : (
        <div className="course-detail__actions disinab-course-buy__actions">
          {isFree ? (
            user ? (
              <CourseFreeEnrollment slug={slug} />
            ) : (
              <Button href={`/login?next=/courses/${encodeURIComponent(slug)}`}>
                دسترسی رایگان با ورود
              </Button>
            )
          ) : isPaidOffer ? (
            purchaseEnabled ? (
              <Button href={purchaseHref}>
                {user ? "ثبت‌نام در این دوره" : "ورود و ثبت‌نام"}
              </Button>
            ) : null
          ) : (
            <CourseWaitlistForm
              slug={slug}
              defaultPhone={user?.phone ?? ""}
            />
          )}
        </div>
      )}
    </DisinabPlate>
  );

  return (
    <div className="course-page-shell">
    <article
      className="course-detail course-page course-page--dock course-page--live"
      data-offer={offerTone}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsLd) }}
      />
      <div className="course-page__hero course-page__hero--story">
        <div className="course-story">
          <div className="course-story__split">
            {buyBox}
            <div className="course-story__main disinab-course-main">
              <DisinabPlate
                as="header"
                className="course-story__intro disinab-course-intro"
                aria-labelledby={
                  course.description ? "course-desc-heading" : undefined
                }
              >
                <div className="disinab-course-intro__head">
                  <nav className="crumbs disinab-course-intro__crumbs" aria-label="مسیر">
                    <Link href="/">خانه</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/courses">دوره‌ها</Link>
                    {course.category ? (
                      <>
                        <span aria-hidden="true">/</span>
                        <Link href={`/courses?category=${course.category.slug}`}>
                          {course.category.title}
                        </Link>
                      </>
                    ) : null}
                  </nav>
                  <DisinabBadge tone="accent">{course.statusLabel}</DisinabBadge>
                </div>
                {(course.topics?.length ?? 0) > 0 ? (
                  <ul className="topic-chip-row" aria-label="موضوعات مرتبط">
                    {course.topics!.map((topic) => (
                      <li key={topic.slug}>
                        <Link href={topic.href} className="topic-chip">
                          {topic.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {course.previewAsset || course.coverAsset ? (
                  <figure className="course-plate">
                    {course.previewAsset ? (
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        src={course.previewAsset}
                        poster={course.coverAsset ?? undefined}
                        aria-label={`ویدیوی معرفی «${course.title}»`}
                      />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={course.coverAsset!}
                        alt=""
                        decoding="async"
                        fetchPriority="high"
                      />
                    )}
                  </figure>
                ) : null}
                {course.description ? (
                  <div className="disinab-course-intro__desc">
                    <h2 id="course-desc-heading">توضیحات دوره</h2>
                    <CourseDescription body={course.description} />
                  </div>
                ) : null}
              </DisinabPlate>

              <CourseSyllabus
                modules={course.modules}
                isFree={isFree}
                spotPlayerProtected={Boolean(course.spotPlayerProtected)}
                authed={Boolean(user)}
                loginHref={`/login?next=/courses/${encodeURIComponent(slug)}`}
              />
            </div>
          </div>
        </div>
      </div>

      {(course.purchaseNotes?.length ?? 0) > 0 ? (
        <DisinabPlate
          className="course-notes disinab-course-notes"
          aria-labelledby="before-buy"
        >
          <h2 id="before-buy">قبل از خرید</h2>
          <ul>
            {course.purchaseNotes!.map((note) => (
              <li
                key={note.id}
                data-scope={note.scope}
                className={
                  note.scope === "course"
                    ? "course-notes__item course-notes__item--exclusive"
                    : "course-notes__item"
                }
              >
                <CoursePurchaseNoteBody body={note.body} />
              </li>
            ))}
          </ul>
        </DisinabPlate>
      ) : null}

      {tracks.length > 0 ? (
        <CourseTrackTimeline tracks={tracks} ownedSlugs={owned} />
      ) : null}

      {related.length > 0 ? (
        <DisinabPlate
          className="course-related disinab-related"
          aria-labelledby="related"
        >
          <header className="disinab-related__head">
            <div>
              <h2 id="related">همین موضوع</h2>
              <p className="disinab__line">
                دوره‌های هم‌قلمرو برای ادامهٔ مسیر یادگیری.
              </p>
            </div>
            <DisinabBadge tone="accent">پیشنهاد</DisinabBadge>
          </header>
          <DisinabCourseCarousel
            courses={related}
            ariaLabel="دوره‌های پیشنهادی هم‌موضوع"
            ownedSlugs={[...owned]}
          />
        </DisinabPlate>
      ) : null}

      {relatedArticles.length > 0 ? (
        <DisinabPlate
          className="course-related course-articles course-articles--row disinab-course-articles"
          aria-labelledby="related-articles"
        >
          <header className="disinab-related__head disinab-course-articles__head">
            <div>
              <h2 id="related-articles">مرتبط با این موضوع</h2>
              <p className="disinab__line">
                یادداشت‌های کوتاه هم‌موضوع برای ادامهٔ مسیر.
              </p>
            </div>
            <DisinabBadge tone="muted">ژورنال</DisinabBadge>
          </header>
          <div className="course-articles__scroller disinab-course-articles__scroller">
            <ul className="course-articles__track disinab-course-articles__track">
              {relatedArticles.map((article, index) => (
                <li key={article.id}>
                  <ArticleCard article={article} index={index} />
                </li>
              ))}
            </ul>
          </div>
        </DisinabPlate>
      ) : null}

    </article>
      <CourseStickyBar
        title={course.title}
        priceLabel={sticky.priceLabel}
        href={sticky.href}
        label={sticky.label}
      />
    </div>
  );
}
