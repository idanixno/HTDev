import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@zharfa/ui";
import { AddToCartButton } from "../../../../components/add-to-cart-button";
import { CourseStickyBar } from "../../../../components/course-sticky-bar";
import { CourseSyllabus } from "../../../../components/course-syllabus";
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
  canAddCourseToCart,
  courseDiscount,
  formatCourseDuration,
  fetchCourse,
  fetchCourseTracks,
  fetchCourses,
  fetchRelatedArticles,
  toCartItem,
} from "../../../../lib/catalog";
import { absoluteUrl } from "../../../../lib/site-url";
import { fetchCheckoutOptions } from "../../../../lib/commerce";
import { ownedCourseSlugs, userOwnsCourse } from "../../../../lib/enrollment";
import { relativePublished } from "../../../../lib/relative-time";
import { buildPageMetadata } from "../../../../lib/seo";
import { fetchCurrentUser } from "../../../../lib/session";
import {
  breadcrumbJsonLd,
  courseJsonLd,
} from "../../../../lib/structured-data";

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
    fetchCourseTracks(slug),
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
        priceLabel: "دسترسی فعال",
      }
    : isFree
      ? {
          href: user
            ? `/api/courses/${encodeURIComponent(slug)}/download`
            : `/login?next=/courses/${encodeURIComponent(slug)}`,
          label: user
            ? "دانلود تمام ویدیوها"
            : "ورود برای مشاهده",
          priceLabel: "رایگان",
        }
      : isPaidOffer
        ? purchaseEnabled
          ? {
              href: purchaseHref,
              label: user ? "ثبت‌نام در این دوره" : "ورود و ثبت‌نام",
              priceLabel: course.priceLabel,
              secondaryHref: canAddCourseToCart(course)
                ? "#course-buy"
                : undefined,
              secondaryLabel: canAddCourseToCart(course)
                ? "سبد خرید"
                : undefined,
            }
          : {
              href: "#course-buy",
              label: canAddCourseToCart(course)
                ? "افزودن به سبد"
                : "مشاهده دوره",
              priceLabel: course.priceLabel,
            }
        : {
            href: "#course-buy",
            label: "پیش‌ثبت‌نام",
            priceLabel: course.priceLabel,
          };

  const buyFacts = [
    { label: "مدرس", value: "آرمان راد" },
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
    >
      {enrolled ? (
        <div className="course-enrolled">
          <div className="disinab-course-buy__head">
            <DisinabBadge tone="live">فعال</DisinabBadge>
          </div>
          <p className="course-enrolled__title">شما دانشجوی این دوره هستید.</p>
          <p className="disinab__line">
            {isFree
              ? "ویدیوها را همین‌جا مشاهده کنید یا یکجا دانلود بگیرید."
              : "کلید لایسنس در حساب شماست و خرید دوباره لازم نیست."}
          </p>
        </div>
      ) : (
        <>
          <div className="disinab-course-buy__head">
            <DisinabBadge tone="accent">{course.statusLabel}</DisinabBadge>
          </div>
          <p className="course-detail__price">
            <span>{course.priceLabel}</span>
            {discount ? (
              <>
                <s>{discount.compareLabel}</s>
                <em>{discount.badge}</em>
              </>
            ) : null}
          </p>
        </>
      )}
      <DisinabFacts items={buyFacts} />
      {enrolled ? (
        <div className="course-detail__actions disinab-course-buy__actions">
          <Button href="/dashboard#courses" variant="secondary">
            مشاهده در حساب من
          </Button>
        </div>
      ) : (
        <div className="course-detail__actions disinab-course-buy__actions">
          {isFree ? null : canAddCourseToCart(course) ? (
            <AddToCartButton item={toCartItem(course)} />
          ) : null}
          {isFree ? (
            <Button
              href={
                user
                  ? `/api/courses/${encodeURIComponent(slug)}/download`
                  : `/login?next=/courses/${encodeURIComponent(slug)}`
              }
              {...(user ? { download: true } : {})}
            >
              {user ? "شروع دوره رایگان" : "ورود برای مشاهده"}
            </Button>
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
                aria-labelledby="course-title"
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
                <h1 id="course-title">{course.title}</h1>
                {course.summary ? (
                  <p className="disinab__line course-story__lead">
                    {course.summary}
                  </p>
                ) : null}
              </DisinabPlate>

              {course.description ? (
                <DisinabPlate
                  className="course-about disinab-course-about"
                  aria-labelledby="course-about"
                >
                  <h2 id="course-about">دربارهٔ این دوره</h2>
                  <p className="disinab__line">{course.description}</p>
                </DisinabPlate>
              ) : null}

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
              {relatedArticles.map((article) => {
                const when = relativePublished(article.publishedAt);
                return (
                  <li key={article.id}>
                    <article className="note-card disinab-course-articles__card">
                      <Link href={article.href} className="note-card__media">
                        {article.coverAsset ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={article.coverAsset} alt="" />
                        ) : (
                          <span className="dx-wordmark dx-wordmark--inline">
                            DXCode
                          </span>
                        )}
                      </Link>
                      <div className="note-card__body">
                        <p className="note-card__meta">
                          {when ? <span>{when}</span> : null}
                          <span>
                            {article.readingMinutes.toLocaleString("fa-IR")}{" "}
                            دقیقه مطالعه
                          </span>
                        </p>
                        <h3>
                          <Link href={article.href}>{article.title}</Link>
                        </h3>
                        {article.summary ? (
                          <p className="note-card__summary">{article.summary}</p>
                        ) : null}
                        <Link
                          className="note-card__read disinab-course-articles__read"
                          href={article.href}
                        >
                          خواندن مقاله
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
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
        secondaryHref={sticky.secondaryHref}
        secondaryLabel={sticky.secondaryLabel}
      />
    </div>
  );
}
