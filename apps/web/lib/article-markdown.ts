export type Inline =
  | { type: "text"; text: string }
  | { type: "code"; text: string }
  | { type: "strong"; text: string }
  | { type: "em"; text: string }
  | { type: "link"; text: string; href: string }
  | { type: "image"; alt: string; src: string };

export type Block =
  | { type: "h2" | "h3" | "h4"; inlines: Inline[]; id: string }
  | { type: "p"; inlines: Inline[] }
  | { type: "ul" | "ol"; items: Inline[][] }
  | { type: "quote"; inlines: Inline[] }
  | { type: "code"; lang: string | null; text: string }
  | { type: "image"; alt: string; src: string }
  | { type: "video"; caption: string; src: string }
  | { type: "course"; slug: string }
  | { type: "table"; headers: Inline[][]; rows: Inline[][][] }
  | { type: "faq"; question: Inline[]; answer: Block[] }
  | { type: "hr" };

export function inlinePlainText(items: Inline[]): string {
  return items
    .map((item) => {
      if (item.type === "image") return item.alt;
      if (item.type === "link") return item.text;
      return item.text;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** Stable, URL-safe id from heading text (Persian + Latin). */
export function headingId(items: Inline[], used: Set<string>): string {
  const base =
    inlinePlainText(items)
      .toLocaleLowerCase("fa-IR")
      .replace(/[^\p{L}\p{N}\s_-]+/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 64) || "بخش";
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

const VIDEO_EXT = /\.(mp4|webm|ogg)$/i;

export function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (!href || href.startsWith("//") || /[\s<>]/.test(href)) return null;
  if (href.startsWith("/")) return href;
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

function isVideoSrc(src: string): boolean {
  const path = src.split(/[?#]/)[0] ?? src;
  return VIDEO_EXT.test(path);
}

function parseInline(input: string): Inline[] {
  const out: Inline[] = [];
  let buffer = "";
  let index = 0;

  const flush = () => {
    if (!buffer) return;
    out.push({ type: "text", text: buffer });
    buffer = "";
  };

  while (index < input.length) {
    if (input[index] === "`") {
      const end = input.indexOf("`", index + 1);
      if (end > index + 1) {
        flush();
        out.push({ type: "code", text: input.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }

    const strongMark = input.startsWith("**", index)
      ? "**"
      : input.startsWith("__", index)
        ? "__"
        : null;
    if (strongMark) {
      const end = input.indexOf(strongMark, index + 2);
      if (end > index + 2) {
        flush();
        out.push({ type: "strong", text: input.slice(index + 2, end) });
        index = end + 2;
        continue;
      }
    }

    const mark = input[index];
    if (
      (mark === "*" || mark === "_") &&
      input[index + 1] !== mark
    ) {
      const end = input.indexOf(mark, index + 1);
      if (end > index + 1) {
        flush();
        out.push({ type: "em", text: input.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }

    const image = matchMedia(input, index, true);
    if (image) {
      const src = safeHref(image.src);
      if (src && !isVideoSrc(src)) {
        flush();
        out.push({ type: "image", alt: image.label, src });
        index = image.next;
        continue;
      }
    }

    const link = matchMedia(input, index, false);
    if (link) {
      const href = safeHref(link.src);
      if (href) {
        flush();
        out.push({ type: "link", text: link.label, href });
        index = link.next;
        continue;
      }
    }

    buffer += input[index];
    index += 1;
  }

  flush();
  return out;
}

function matchMedia(
  input: string,
  index: number,
  image: boolean,
): { label: string; src: string; next: number } | null {
  const start = image ? index : index;
  if (image) {
    if (input[start] !== "!" || input[start + 1] !== "[") return null;
  } else if (input[start] !== "[") {
    return null;
  }
  const labelStart = image ? start + 2 : start + 1;
  const labelEnd = input.indexOf("]", labelStart);
  if (labelEnd < 0 || input[labelEnd + 1] !== "(") return null;
  const srcEnd = input.indexOf(")", labelEnd + 2);
  if (srcEnd < 0) return null;
  return {
    label: input.slice(labelStart, labelEnd),
    src: input.slice(labelEnd + 2, srcEnd).trim(),
    next: srcEnd + 1,
  };
}

function headingLevel(marks: number): "h2" | "h3" | "h4" {
  if (marks <= 2) return "h2";
  if (marks === 3) return "h3";
  return "h4";
}

function isStructural(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("```") ||
    /^#{1,4}\s+\S/.test(trimmed) ||
    /^!video\[[^\]]*\]\([^)\s]+\)$/.test(trimmed) ||
    /^!\[[^\]]*\]\([^)\s]+\)$/.test(trimmed) ||
    /^(---|\*\*\*)$/.test(trimmed) ||
    trimmed.startsWith(">") ||
    /^[-*]\s+\S/.test(trimmed) ||
    /^\d+\.\s+\S/.test(trimmed) ||
    trimmed.startsWith("|") ||
    /^!course\[[a-z0-9-]+\]$/.test(trimmed) ||
    /^!faq\[/.test(trimmed) ||
    trimmed === "!/faq"
  );
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableRule(line: string): boolean {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function lineAt(lines: string[], index: number): string {
  return lines[index] ?? "";
}

function parseBlocks(
  lines: string[],
  start: number,
  stopAtFaqEnd: boolean,
  usedIds: Set<string>,
): { blocks: Block[]; next: number } {
  const blocks: Block[] = [];
  let index = start;

  while (index < lines.length) {
    const trimmed = lineAt(lines, index).trim();
    if (!trimmed) {
      index += 1;
      continue;
    }

    if (stopAtFaqEnd && trimmed === "!/faq") {
      break;
    }

    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim() || null;
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lineAt(lines, index).trim().startsWith("```")) {
        code.push(lineAt(lines, index));
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", lang, text: code.join("\n").replace(/\n$/, "") });
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading?.[1] && heading[2]) {
      const inlines = parseInline(heading[2].trim());
      blocks.push({
        type: headingLevel(heading[1].length),
        inlines,
        id: headingId(inlines, usedIds),
      });
      index += 1;
      continue;
    }

    const faqOpen = /^!faq\[([^\]]*)\]\s*$/.exec(trimmed);
    if (faqOpen) {
      index += 1;
      const nested = parseBlocks(lines, index, true, usedIds);
      blocks.push({
        type: "faq",
        question: parseInline((faqOpen[1] ?? "").trim() || "پرسش"),
        answer: nested.blocks,
      });
      index = nested.next;
      if (index < lines.length && lineAt(lines, index).trim() === "!/faq") {
        index += 1;
      }
      continue;
    }

    const video = /^!video\[([^\]]*)\]\(([^)\s]+)\)$/.exec(trimmed);
    if (video?.[2]) {
      const src = safeHref(video[2]);
      if (src) {
        blocks.push({ type: "video", caption: (video[1] ?? "").trim(), src });
      }
      index += 1;
      continue;
    }

    const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(trimmed);
    if (image?.[2]) {
      const src = safeHref(image[2]);
      if (src) {
        const caption = (image[1] ?? "").trim();
        blocks.push(
          isVideoSrc(src)
            ? { type: "video", caption, src }
            : { type: "image", alt: caption, src },
        );
      }
      index += 1;
      continue;
    }

    if (/^(---|\*\*\*)$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    const course = /^!course\[([a-z0-9-]+)\]$/.exec(trimmed);
    if (course?.[1]) {
      blocks.push({ type: "course", slug: course[1] });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lineAt(lines, index).trim().startsWith("|")) {
        tableLines.push(lineAt(lines, index).trim());
        index += 1;
      }
      const headerLine = tableLines[0];
      if (!headerLine) continue;
      const ruleLine = tableLines[1];
      const rule = Boolean(ruleLine && isTableRule(ruleLine));
      const header = splitTableRow(headerLine).map((cell) => parseInline(cell));
      const bodyLines = tableLines.slice(rule ? 2 : 1);
      blocks.push({
        type: "table",
        headers: header,
        rows: bodyLines.map((line) =>
          splitTableRow(line).map((cell) => parseInline(cell)),
        ),
      });
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lineAt(lines, index).trim().startsWith(">")) {
        quote.push(lineAt(lines, index).trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", inlines: parseInline(quote.join(" ")) });
      continue;
    }

    if (/^[-*]\s+\S/.test(trimmed)) {
      const items: Inline[][] = [];
      while (index < lines.length && /^[-*]\s+\S/.test(lineAt(lines, index).trim())) {
        items.push(
          parseInline(lineAt(lines, index).trim().replace(/^[-*]\s+/, "")),
        );
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+\S/.test(trimmed)) {
      const items: Inline[][] = [];
      while (index < lines.length && /^\d+\.\s+\S/.test(lineAt(lines, index).trim())) {
        items.push(
          parseInline(lineAt(lines, index).trim().replace(/^\d+\.\s+/, "")),
        );
        index += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lineAt(lines, index).trim() &&
      !isStructural(lineAt(lines, index))
    ) {
      paragraph.push(lineAt(lines, index).trim());
      index += 1;
    }
    if (paragraph.length > 0) {
      blocks.push({ type: "p", inlines: parseInline(paragraph.join(" ")) });
    }
  }

  return { blocks, next: index };
}

export function parseArticleMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  return parseBlocks(lines, 0, false, new Set()).blocks;
}

export function extractFaqItems(
  blocks: Block[],
): Array<{ question: string; answer: string }> {
  const items: Array<{ question: string; answer: string }> = [];
  for (const block of blocks) {
    if (block.type !== "faq") continue;
    const answer = block.answer
      .map((part) => {
        if (part.type === "p" || part.type === "quote") {
          return inlinePlainText(part.inlines);
        }
        if (part.type === "ul" || part.type === "ol") {
          return part.items.map((item) => inlinePlainText(item)).join(" ");
        }
        if (part.type === "code") return part.text;
        return "";
      })
      .filter(Boolean)
      .join(" ");
    items.push({
      question: inlinePlainText(block.question),
      answer,
    });
  }
  return items;
}
