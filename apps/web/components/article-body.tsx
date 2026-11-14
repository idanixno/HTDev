import { Fragment, type ReactNode } from "react";
import {
  parseArticleMarkdown,
  type Block,
  type Inline,
} from "../lib/article-markdown";
import { ArticleCodeBlock } from "./article-code-block";

function Inlines({ items }: { items: Inline[] }) {
  return items.map((item, index) => {
    if (item.type === "text") return <Fragment key={index}>{item.text}</Fragment>;
    if (item.type === "code") return <code key={index}>{item.text}</code>;
    if (item.type === "strong") return <strong key={index}>{item.text}</strong>;
    if (item.type === "em") return <em key={index}>{item.text}</em>;
    if (item.type === "image") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={index} src={item.src} alt={item.alt} />
      );
    }
    const external = item.href.startsWith("http");
    return (
      <a
        key={index}
        href={item.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {item.text}
      </a>
    );
  });
}

function BlockView({
  block,
  courses,
}: {
  block: Block;
  courses?: Record<string, ReactNode>;
}) {
  if (block.type === "h2" || block.type === "h3" || block.type === "h4") {
    const Tag = block.type;
    return (
      <Tag id={block.id}>
        <Inlines items={block.inlines} />
      </Tag>
    );
  }
  if (block.type === "p") {
    return (
      <p>
        <Inlines items={block.inlines} />
      </p>
    );
  }
  if (block.type === "ul" || block.type === "ol") {
    const Tag = block.type;
    return (
      <Tag>
        {block.items.map((item, index) => (
          <li key={index}>
            <Inlines items={item} />
          </li>
        ))}
      </Tag>
    );
  }
  if (block.type === "quote") {
    return (
      <blockquote>
        <Inlines items={block.inlines} />
      </blockquote>
    );
  }
  if (block.type === "code") {
    return <ArticleCodeBlock lang={block.lang} text={block.text} />;
  }
  if (block.type === "image") {
    return (
      <figure className="article-body__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.src} alt={block.alt} />
        {block.alt ? <figcaption>{block.alt}</figcaption> : null}
      </figure>
    );
  }
  if (block.type === "video") {
    return (
      <figure className="article-body__media article-body__media--video">
        <video controls playsInline preload="metadata" src={block.src} />
        {block.caption ? <figcaption>{block.caption}</figcaption> : null}
      </figure>
    );
  }
  if (block.type === "course") {
    return (
      <div className="article-body__course">
        {courses?.[block.slug] ?? (
          <p>
            <a href={`/courses/${block.slug}`}>دورهٔ {block.slug}</a>
          </p>
        )}
      </div>
    );
  }
  if (block.type === "table") {
    return (
      <div className="article-table">
        <table>
          <thead>
            <tr>
              {block.headers.map((cell, index) => (
                <th key={index} scope="col">
                  <Inlines items={cell} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {block.headers.map((_, cellIndex) => (
                  <td key={cellIndex}>
                    <Inlines items={row[cellIndex] ?? []} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (block.type === "faq") {
    return (
      <details className="article-faq">
        <summary className="article-faq__q">
          <span>
            <Inlines items={block.question} />
          </span>
          <span className="article-faq__mark" aria-hidden="true" />
        </summary>
        <div className="article-faq__a">
          {block.answer.map((part, index) => (
            <BlockView key={index} block={part} courses={courses} />
          ))}
        </div>
      </details>
    );
  }
  return <hr />;
}

export function ArticleBody({
  body,
  courses,
}: {
  body: string;
  courses?: Record<string, ReactNode>;
}) {
  const blocks = parseArticleMarkdown(body);
  return <ArticleBodyBlocks blocks={blocks} courses={courses} />;
}

export function ArticleBodyBlocks({
  blocks,
  courses,
}: {
  blocks: Block[];
  courses?: Record<string, ReactNode>;
}) {
  return (
    <div className="article-body">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} courses={courses} />
      ))}
    </div>
  );
}
