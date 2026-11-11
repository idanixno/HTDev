import Link from "next/link";
import type { CSSProperties } from "react";
import type { PublicArticleCard } from "../lib/catalog";
import { relativePublished } from "../lib/relative-time";

type ArticleCardArticle = Pick<
  PublicArticleCard,
  | "href"
  | "title"
  | "summary"
  | "coverAsset"
  | "publishedAt"
  | "readingMinutes"
>;

type ArticleCardProps = {
  article: ArticleCardArticle;
  headingLevel?: 2 | 3;
  index?: number;
  className?: string;
};

export function ArticleCard({
  article,
  headingLevel = 3,
  index,
  className,
}: ArticleCardProps) {
  const when = relativePublished(article.publishedAt);
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const style =
    index === undefined
      ? undefined
      : ({ "--article-i": index } as CSSProperties);

  return (
    <article
      className={["note-card", "disinab-article-card", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <Link href={article.href} className="note-card__media">
        {article.coverAsset ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverAsset} alt="" />
        ) : (
          <span className="note-card__placeholder">DX</span>
        )}
      </Link>
      <div className="note-card__body">
        <p className="note-card__meta">
          {when ? <span>{when}</span> : null}
          <span>
            {article.readingMinutes.toLocaleString("fa-IR")} دقیقه مطالعه
          </span>
        </p>
        <Heading>
          <Link href={article.href}>{article.title}</Link>
        </Heading>
        {article.summary ? (
          <p className="note-card__summary">{article.summary}</p>
        ) : null}
        <Link className="note-card__read disinab-article-card__read" href={article.href}>
          خواندن مقاله
          <span aria-hidden="true">←</span>
        </Link>
      </div>
    </article>
  );
}
