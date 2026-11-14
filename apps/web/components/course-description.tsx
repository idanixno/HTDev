import { ArticleBodyBlocks } from "./article-body";
import {
  inlinePlainText,
  parseArticleMarkdown,
  type Block,
} from "../lib/article-markdown";

type DescriptionSegment = {
  kind: "body" | "audience" | "faq";
  blocks: Block[];
};

function normalizeHeading(text: string): string {
  return text
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ؤ/g, "و")
    .replace(/\u0640/g, "")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[؟?!.,:؛]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fa-IR");
}

function sectionKind(block: Block): "audience" | "faq" | null {
  if (block.type !== "h2") return null;
  const heading = normalizeHeading(inlinePlainText(block.inlines));
  if (
    [
      "این دوره برای چه کسانی مناسبه",
      "این دوره برای چه کسانی مناسب است",
      "این دوره مناسب چه کسانی است",
    ].includes(heading)
  ) {
    return "audience";
  }
  if (
    ["سوالات متداول", "پرسش های متداول", "پرسشهای متداول"].includes(heading)
  ) {
    return "faq";
  }
  return null;
}

function splitDescription(blocks: Block[]): DescriptionSegment[] {
  const segments: DescriptionSegment[] = [];
  let body: Block[] = [];

  function flushBody() {
    if (body.length) segments.push({ kind: "body", blocks: body });
    body = [];
  }

  for (let index = 0; index < blocks.length; ) {
    const kind = sectionKind(blocks[index]!);
    if (!kind) {
      body.push(blocks[index]!);
      index += 1;
      continue;
    }

    flushBody();
    const section: Block[] = [blocks[index]!];
    index += 1;
    while (index < blocks.length && blocks[index]!.type !== "h2") {
      section.push(blocks[index]!);
      index += 1;
    }
    segments.push({ kind, blocks: section });
  }
  flushBody();
  return segments;
}

export function CourseDescription({ body }: { body: string }) {
  const segments = splitDescription(parseArticleMarkdown(body));
  return (
    <div className="course-description">
      {segments.map((segment, index) =>
        segment.kind === "body" ? (
          <ArticleBodyBlocks key={index} blocks={segment.blocks} />
        ) : (
          <section
            key={index}
            className={`course-description__section course-description__section--${segment.kind}`}
            aria-label={
              segment.kind === "faq" ? "سوالات متداول" : "این دوره برای چه کسانی مناسبه؟"
            }
          >
            <ArticleBodyBlocks blocks={segment.blocks} />
          </section>
        ),
      )}
    </div>
  );
}
