export type SeoIssueSeverity = "critical" | "warning" | "suggestion";

export type SeoIssue = {
  id: string;
  severity: SeoIssueSeverity;
  field?: string;
  message: string;
  fixHint?: string;
};

export type SeoScores = {
  overall: number;
  metadata: number;
  onpage: number;
  content: number;
  media: number;
  structure: number;
  links: number;
};

export type SeoDiagnostics = {
  titleLength: number;
  titleIdeal: [number, number];
  descriptionLength: number;
  descriptionIdeal: [number, number];
  bodyChars: number;
  bodyWords: number;
  h2Count: number;
  h3Count: number;
  imageCount: number;
  imagesMissingAlt: number;
  internalLinks: number;
  faqCount: number;
};

export type SeoAnalyzeInput = {
  entityType: "COURSE" | "ARTICLE" | "PATH_STEP";
  title: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  summary?: string | null;
  body?: string | null;
  h1?: string | null;
  coverAsset?: string | null;
  coverAlt?: string | null;
  ogImage?: string | null;
  noIndex?: boolean;
  published?: boolean;
};

export type SeoAnalyzeResult = {
  scores: SeoScores;
  issues: SeoIssue[];
  diagnostics: SeoDiagnostics;
  effectiveTitle: string;
  effectiveDescription: string;
};

/** Google SERP-oriented ideal ranges (character counts). */
const TITLE_IDEAL: [number, number] = [30, 60];
const DESC_IDEAL: [number, number] = [120, 160];

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function charLen(s: string | null | undefined) {
  return (s ?? "").trim().length;
}

/** Rough word estimate for FA/EN mixed copy. */
function wordEstimate(text: string) {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_`|-]+/g, " ")
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

/**
 * Score a numeric metric against an ideal window.
 * 100 inside [idealMin, idealMax]; tapers to 0 at soft edges.
 */
function rangeScore(
  value: number,
  idealMin: number,
  idealMax: number,
  softMin: number,
  softMax: number,
) {
  if (value >= idealMin && value <= idealMax) return 100;
  if (value < softMin || value > softMax) return 0;
  if (value < idealMin) {
    return clamp(((value - softMin) / (idealMin - softMin)) * 100);
  }
  return clamp(((softMax - value) / (softMax - idealMax)) * 100);
}

function countHeadings(md: string) {
  const lines = md.split(/\r?\n/);
  let h2 = 0;
  let h3 = 0;
  for (const line of lines) {
    if (/^##\s+\S/.test(line)) h2 += 1;
    else if (/^###\s+\S/.test(line)) h3 += 1;
  }
  return { h2, h3 };
}

function countInternalLinks(md: string) {
  // Exclude markdown images (`![alt](/path)`); count only text links to site paths.
  const links = md.match(/(?<!!)\[([^\]]+)\]\((\/[^)]+)\)/g) ?? [];
  return links.length;
}

function countImages(md: string) {
  const imgs = md.match(/!\[[^\]]*\]\([^)]+\)/g) ?? [];
  const missingAlt = imgs.filter((img) => /^!\[\s*\]\(/.test(img)).length;
  return { total: imgs.length, missingAlt };
}

function countFaqBlocks(md: string) {
  return (md.match(/^!faq\[/gm) ?? []).length;
}

function slugQuality(slug: string): { score: number; issues: SeoIssue[] } {
  const issues: SeoIssue[] = [];
  let score = 100;
  const s = slug.trim().toLowerCase();
  if (!s) {
    issues.push({
      id: "slug-missing",
      severity: "critical",
      field: "slug",
      message: "اسلاگ خالی است.",
      fixHint: "اسلاگ لاتین کوتاه، خوانا و با خط تیره بگذارید.",
    });
    return { score: 0, issues };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
    score -= 40;
    issues.push({
      id: "slug-format",
      severity: "warning",
      field: "slug",
      message: "اسلاگ فقط باید حروف لاتین کوچک، عدد و خط تیره باشد.",
    });
  }
  if (s.length > 60) {
    score -= 25;
    issues.push({
      id: "slug-long",
      severity: "suggestion",
      field: "slug",
      message: "اسلاگ طولانی است؛ برای URL کوتاه‌تر بهتر است (زیر ۶۰ نویسه).",
    });
  } else if (s.length > 45) {
    score -= 10;
  }
  if (s.length < 3) {
    score -= 30;
    issues.push({
      id: "slug-short",
      severity: "warning",
      field: "slug",
      message: "اسلاگ خیلی کوتاه است.",
    });
  }
  if (/(?:^-)|(?:-$)|--/.test(s)) {
    score -= 15;
    issues.push({
      id: "slug-hyphen",
      severity: "suggestion",
      field: "slug",
      message: "خط تیره‌های ابتدا/انتها یا دوبل در اسلاگ نامطلوب است.",
    });
  }
  return { score: clamp(score), issues };
}

function titleTokenOverlap(title: string, haystack: string) {
  const tokens = title
    .toLocaleLowerCase("fa-IR")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 3);
  if (tokens.length === 0) return 1;
  const hay = haystack.toLocaleLowerCase("fa-IR");
  const hits = tokens.filter((t) => hay.includes(t)).length;
  return hits / tokens.length;
}

export function analyzeContent(input: SeoAnalyzeInput): SeoAnalyzeResult {
  const issues: SeoIssue[] = [];
  const effectiveTitle = (input.seoTitle?.trim() || input.title.trim() || "").trim();
  const effectiveDescription = (
    input.seoDescription?.trim() ||
    input.summary?.trim() ||
    ""
  ).trim();
  const body = (input.body ?? "").trim();
  const copyForLength =
    body || (input.summary ?? "").trim() || (input.seoDescription ?? "").trim();
  const h1 = (input.h1?.trim() || input.title.trim() || "").trim();
  const { h2, h3 } = countHeadings(body);
  const images = countImages(body);
  const internalLinks = countInternalLinks(body);
  const faqCount = countFaqBlocks(body);
  const bodyWords = wordEstimate(copyForLength);
  const titleLength = charLen(effectiveTitle);
  const descriptionLength = charLen(effectiveDescription);

  // —— Metadata (title + description + indexability) ——
  let metadata = 100;
  if (!effectiveTitle) {
    metadata = 0;
    issues.push({
      id: "title-missing",
      severity: "critical",
      field: "seoTitle",
      message: "عنوان SEO موجود نیست.",
      fixHint: "عنوان ۳۰–۶۰ نویسه‌ای و توصیفی بنویسید.",
    });
  } else {
    const titleScore = rangeScore(
      titleLength,
      TITLE_IDEAL[0],
      TITLE_IDEAL[1],
      12,
      80,
    );
    metadata = clamp(metadata * 0.35 + titleScore * 0.65);
    if (titleLength < TITLE_IDEAL[0]) {
      issues.push({
        id: "title-short",
        severity: titleLength < 20 ? "warning" : "suggestion",
        field: "seoTitle",
        message: `عنوان SEO کوتاه است (${titleLength.toLocaleString("fa-IR")} نویسه؛ ایده‌آل ${TITLE_IDEAL[0]}–${TITLE_IDEAL[1]}).`,
      });
    } else if (titleLength > TITLE_IDEAL[1]) {
      issues.push({
        id: "title-long",
        severity: titleLength > 70 ? "warning" : "suggestion",
        field: "seoTitle",
        message: `عنوان SEO بلند است (${titleLength.toLocaleString("fa-IR")} نویسه) و ممکن است در SERP کوتاه شود.`,
      });
    }
  }

  if (!effectiveDescription) {
    metadata = clamp(metadata * 0.55);
    issues.push({
      id: "desc-missing",
      severity: "critical",
      field: "seoDescription",
      message: "توضیح متا خالی است.",
      fixHint: `توضیح ${DESC_IDEAL[0]}–${DESC_IDEAL[1]} نویسه‌ای با دعوت به کلیک بنویسید.`,
    });
  } else {
    const descScore = rangeScore(
      descriptionLength,
      DESC_IDEAL[0],
      DESC_IDEAL[1],
      50,
      220,
    );
    metadata = clamp(metadata * 0.45 + descScore * 0.55);
    if (descriptionLength < DESC_IDEAL[0]) {
      issues.push({
        id: "desc-short",
        severity: descriptionLength < 70 ? "warning" : "suggestion",
        field: "seoDescription",
        message: `توضیح متا کوتاه است (${descriptionLength.toLocaleString("fa-IR")} نویسه؛ ایده‌آل ${DESC_IDEAL[0]}–${DESC_IDEAL[1]}).`,
      });
    } else if (descriptionLength > DESC_IDEAL[1]) {
      issues.push({
        id: "desc-long",
        severity: descriptionLength > 170 ? "warning" : "suggestion",
        field: "seoDescription",
        message: `توضیح متا بلند است (${descriptionLength.toLocaleString("fa-IR")} نویسه)؛ احتمال برش در نتایج گوگل هست.`,
      });
    }
  }

  if (input.noIndex && input.published) {
    metadata = clamp(metadata - 18);
    issues.push({
      id: "noindex-published",
      severity: "warning",
      field: "noIndex",
      message: "محتوا منتشر است ولی noIndex فعال است و ایندکس نمی‌شود.",
    });
  }

  // —— On-page (H1 + slug + title alignment) ——
  let onpage = 100;
  if (!h1) {
    onpage -= 40;
    issues.push({
      id: "h1-missing",
      severity: "critical",
      field: "title",
      message: "عنوان اصلی (H1) مشخص نیست.",
    });
  } else if (h1.length < 8) {
    onpage -= 12;
    issues.push({
      id: "h1-short",
      severity: "suggestion",
      field: "title",
      message: "عنوان نمایشی خیلی کوتاه است.",
    });
  }

  const slug = slugQuality(input.slug);
  onpage = clamp(onpage * 0.55 + slug.score * 0.45);
  issues.push(...slug.issues);

  if (effectiveTitle && h1) {
    const overlap = titleTokenOverlap(h1, effectiveTitle);
    if (overlap < 0.25) {
      onpage = clamp(onpage - 12);
      issues.push({
        id: "h1-seo-align",
        severity: "suggestion",
        field: "seoTitle",
        message: "عنوان SEO با عنوان صفحه هم‌پوشانی کمی دارد.",
        fixHint: "کلیدواژهٔ اصلی عنوان را در SEO Title هم بیاورید.",
      });
    } else if (overlap >= 0.5) {
      onpage = clamp(onpage + 4);
    }
  }

  if (effectiveTitle && input.slug) {
    const overlap = titleTokenOverlap(effectiveTitle, input.slug.replace(/-/g, " "));
    if (overlap < 0.15 && input.entityType !== "COURSE") {
      onpage = clamp(onpage - 6);
      issues.push({
        id: "slug-topic",
        severity: "suggestion",
        field: "slug",
        message: "اسلاگ با موضوع عنوان هم‌راستا نیست.",
      });
    }
  }

  // —— Content depth ——
  let content = 100;
  const minWords =
    input.entityType === "ARTICLE" ? 300 : input.entityType === "PATH_STEP" ? 180 : 40;
  const idealWords =
    input.entityType === "ARTICLE" ? 700 : input.entityType === "PATH_STEP" ? 400 : 80;
  if (bodyWords === 0) {
    content = input.entityType === "COURSE" && charLen(input.summary) > 40 ? 55 : 20;
    issues.push({
      id: "content-thin",
      severity: "critical",
      field: body ? "body" : "summary",
      message:
        input.entityType === "COURSE"
          ? "توضیح/خلاصه دوره برای پوشش موضوع کافی نیست."
          : "متن اصلی خالی یا بسیار نازک است.",
    });
  } else if (bodyWords < minWords) {
    content = clamp((bodyWords / minWords) * 70);
    issues.push({
      id: "content-thin",
      severity: "warning",
      field: "body",
      message: `حجم محتوا حدود ${bodyWords.toLocaleString("fa-IR")} واژه است؛ برای این نوع صفحه حداقل حدود ${minWords.toLocaleString("fa-IR")} واژه پیشنهاد می‌شود.`,
    });
  } else {
    content = clamp(70 + Math.min(30, ((bodyWords - minWords) / (idealWords - minWords)) * 30));
  }

  // —— Media ——
  let media = 100;
  const hasShareImage = Boolean(input.coverAsset || input.ogImage);
  if (!hasShareImage) {
    media -= 28;
    issues.push({
      id: "cover-missing",
      severity: "warning",
      field: "coverAsset",
      message: "تصویر کاور/اشتراک‌گذاری تنظیم نشده است.",
    });
  } else if (input.coverAsset && input.coverAlt != null && !input.coverAlt.trim()) {
    media -= 16;
    issues.push({
      id: "cover-alt-missing",
      severity: "warning",
      field: "coverAlt",
      message: "متن جایگزین تصویر کاور خالی است.",
    });
  }
  if (images.total > 0) {
    const altRatio = (images.total - images.missingAlt) / images.total;
    media = clamp(media * 0.55 + altRatio * 100 * 0.45);
    if (images.missingAlt > 0) {
      issues.push({
        id: "inline-alt-missing",
        severity: "warning",
        field: "body",
        message: `${images.missingAlt.toLocaleString("fa-IR")} از ${images.total.toLocaleString("fa-IR")} تصویر متن بدون alt است.`,
        fixHint: "برای هر تصویر متن جایگزین معنادار بنویسید: ![توضیح](/path).",
      });
    }
  } else if (input.entityType === "ARTICLE" || input.entityType === "PATH_STEP") {
    media = clamp(media - 8);
    issues.push({
      id: "inline-media-none",
      severity: "suggestion",
      field: "body",
      message: "تصویر یا ویدیوی درون‌متنی ندارید؛ برای درک بهتر مفید است.",
    });
  }

  // —— Structure ——
  let structure = 100;
  if (input.entityType === "ARTICLE" || input.entityType === "PATH_STEP") {
    if (h2 === 0) {
      structure -= 35;
      issues.push({
        id: "structure-flat",
        severity: "warning",
        field: "body",
        message: "هیچ H2 ندارید؛ ساختار تیترها برای اسکَن و SEO ضعیف است.",
      });
    } else {
      const expectedH2 = Math.max(2, Math.min(8, Math.round(bodyWords / 220)));
      if (h2 < expectedH2) {
        structure -= Math.min(25, (expectedH2 - h2) * 8);
        issues.push({
          id: "headings-few",
          severity: "warning",
          field: "body",
          message: `با این حجم محتوا حدود ${expectedH2.toLocaleString("fa-IR")} زیرعنوان H2 بهتر است (الان ${h2.toLocaleString("fa-IR")}).`,
        });
      }
      if (h3 > Math.max(2, h2 * 4)) {
        structure -= 12;
        issues.push({
          id: "structure-h3-heavy",
          severity: "suggestion",
          field: "body",
          message: "تعداد H3 نسبت به H2 زیاد است؛ سلسله‌مراتب را ساده‌تر کنید.",
        });
      }
    }
    if (faqCount > 0) {
      structure = clamp(structure + Math.min(8, faqCount * 3));
    }
  } else if (!input.summary?.trim() && !body) {
    structure -= 25;
  }

  // —— Links ——
  let links = 72;
  if (body) {
    if (internalLinks === 0 && (input.entityType === "ARTICLE" || input.entityType === "PATH_STEP")) {
      links = 48;
      issues.push({
        id: "internal-links",
        severity: "suggestion",
        field: "body",
        message: "لینک داخلی به دوره/مقاله/مسیر مرتبط پیشنهاد می‌شود.",
      });
    } else if (internalLinks > 0) {
      links = clamp(68 + Math.min(32, internalLinks * 12));
    }
  } else {
    links = 55;
  }

  metadata = clamp(metadata);
  onpage = clamp(onpage);
  content = clamp(content);
  media = clamp(media);
  structure = clamp(structure);
  links = clamp(links);

  // Weights aligned with practical SEO priority (content + metadata dominate).
  const overall = clamp(
    metadata * 0.24 +
      onpage * 0.18 +
      content * 0.28 +
      media * 0.1 +
      structure * 0.12 +
      links * 0.08,
  );

  if (overall >= 88 && issues.every((i) => i.severity === "suggestion")) {
    issues.push({
      id: "healthy",
      severity: "suggestion",
      message: "امتیاز SEO در بازهٔ خوب است؛ فقط بهبودهای اختیاری مانده‌اند.",
    });
  }

  return {
    scores: {
      overall,
      metadata,
      onpage,
      content,
      media,
      structure,
      links,
    },
    issues,
    diagnostics: {
      titleLength,
      titleIdeal: TITLE_IDEAL,
      descriptionLength,
      descriptionIdeal: DESC_IDEAL,
      bodyChars: charLen(copyForLength),
      bodyWords,
      h2Count: h2,
      h3Count: h3,
      imageCount: images.total,
      imagesMissingAlt: images.missingAlt,
      internalLinks,
      faqCount,
    },
    effectiveTitle,
    effectiveDescription,
  };
}
