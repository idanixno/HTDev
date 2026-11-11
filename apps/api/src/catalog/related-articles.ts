/** Rank published journal notes against a course's topic signals (copy + syllabus). */

const FA_STOPWORDS = new Set([
  "از",
  "به",
  "در",
  "با",
  "که",
  "این",
  "آن",
  "را",
  "و",
  "یا",
  "هم",
  "برای",
  "تا",
  "یک",
  "می",
  "شده",
  "است",
  "بود",
  "شود",
  "روی",
  "فقط",
  "اگر",
  "اما",
  "پس",
  "چون",
  "چه",
  "آیا",
  "نه",
  "هر",
  "چند",
  "دو",
  "سه",
  "ما",
  "شما",
  "او",
  "ایشان",
  "خود",
  "نیز",
  "بین",
  "بعد",
  "قبل",
  "بدون",
  "مثل",
  "همان",
  "همین",
  "دیگر",
  "خیلی",
  "بیشتر",
  "کمتر",
  "حدود",
  "می‌شود",
  "میشود",
  "هستند",
  "باشند",
  "باشد",
  "کرد",
  "کردن",
  "کرده",
  "داشته",
  "دارد",
  "دارند",
  "توان",
  "باید",
  "شاید",
  "حتی",
  "وقتی",
  "زمانی",
  "جایی",
  "کسی",
  "چیزی",
  "هیچ",
  "همه",
  "تمام",
  "درباره",
  "مورد",
  "صورت",
  "طریق",
  "طی",
  "ضمن",
  "سپس",
  "اول",
  "دوم",
  "سوم",
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "into",
  "your",
  "you",
  "are",
  "was",
  "were",
  "have",
  "has",
  "will",
  "can",
  "not",
  // Catalog / CMS generics that appear on almost every course page
  "دوره",
  "دوره‌ها",
  "مقاله",
  "مقالات",
  "آموزش",
  "آموزشی",
  "خرید",
  "سایت",
  "صفحه",
  "کاتالوگ",
  "DXCode",
  "درس",
  "دروس",
  "سرفصل",
  "سرفصل‌ها",
  "مدرس",
  "سطح",
  "پیشرفته",
  "مبتدی",
  "متوسط",
  "ویدیو",
  "ویدئو",
  "ویدیوها",
  // Plural / connective fragments left after zero-width non-joiner splits
  "ها",
  "های",
  "ان",
  "ات",
  "یون",
  "تغییر",
  "جدا",
  "واقعی",
  "کد",
  "شروع",
  "فارسی",
  "راست",
  "چپ",
  "وضعیت",
  "موفق",
  "دسترسی",
  "صفحه",
  "پیام",
  "هفته",
  "کسی",
  "باید",
  "مثال",
  "تمرکز",
  "تصمیم",
  "هزینه",
  "پایین",
  "نگه",
  "شعار",
  "یکی",
  "نیست",
  "نیستند",
  "نباید",
  "نشان",
  "بدهد",
  "نمی",
  "میکند",
  "نمیکند",
  "نمیشود",
  "کلمه",
  "کلمات",
  "سه",
  "بعدا",
  "اغلب",
  "جواب",
  "کاربر",
  "بازار",
  "نشان",
  "کند",
  "میکند",
  "کنی",
  "کنید",
  "کنم",
  "کنند",
]);

export type CourseTopicSource = {
  title: string;
  summary?: string | null;
  description?: string | null;
  categoryTitle?: string | null;
  levelLabel?: string | null;
  modules: Array<{
    title: string;
    summary?: string | null;
    lessons: Array<{ title: string; summary?: string | null }>;
  }>;
};

export type ArticleMatchSource = {
  id: string;
  title: string;
  summary: string | null;
  body: string;
};

function normalizeFa(text: string): string {
  return text
    .replace(/[\u064A\u0649]/g, "\u06CC")
    .replace(/\u0643/g, "\u06A9")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .toLocaleLowerCase("fa-IR");
}

function stripMarkup(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, " $1 ")
    .replace(/!\w+\[[^\]]*]/g, " ")
    .replace(/[#>*_`~|\\-]+/g, " ");
}

function stemFa(token: string): string {
  let value = token;
  for (const suffix of [
    "ترین",
    "های",
    "یان",
    "یون",
    "مان",
    "تان",
    "شان",
    "ها",
    "ان",
    "ات",
    "تر",
  ]) {
    if (value.length - suffix.length >= 3 && value.endsWith(suffix)) {
      value = value.slice(0, -suffix.length);
      break;
    }
  }
  return value;
}

/** Soft Persian match: exact stem, or shared prefix for longer topical words (کامیت/کامیتی). */
function relatedTokenWeight(
  token: string,
  query: Map<string, number>,
): number {
  const exact = query.get(token);
  if (exact) return exact;
  if (token.length < 5) return 0;
  let best = 0;
  for (const [candidate, weight] of query) {
    if (candidate.length < 5) continue;
    if (token.startsWith(candidate) || candidate.startsWith(token)) {
      best = Math.max(best, weight);
    }
  }
  return best;
}

export function tokenize(text: string): string[] {
  const normalized = normalizeFa(stripMarkup(text));
  return normalized
    .split(/[^\p{L}\p{N}]+/u)
    .map((token) => stemFa(token.trim()))
    .filter((token) => token.length >= 2 && !FA_STOPWORDS.has(token));
}

function addWeightedTokens(
  bag: Map<string, number>,
  text: string | null | undefined,
  weight: number,
) {
  if (!text) return;
  for (const token of tokenize(text)) {
    bag.set(token, (bag.get(token) ?? 0) + weight);
  }
}

export function buildCourseTopicWeights(course: CourseTopicSource): Map<string, number> {
  const bag = new Map<string, number>();
  addWeightedTokens(bag, course.title, 5);
  addWeightedTokens(bag, course.categoryTitle, 4);
  addWeightedTokens(bag, course.levelLabel, 2);
  addWeightedTokens(bag, course.summary, 3);
  addWeightedTokens(bag, course.description, 2);
  for (const mod of course.modules) {
    addWeightedTokens(bag, mod.title, 3);
    addWeightedTokens(bag, mod.summary, 1);
    for (const lesson of mod.lessons) {
      addWeightedTokens(bag, lesson.title, 2);
      addWeightedTokens(bag, lesson.summary, 1);
    }
  }
  return bag;
}

function fieldStats(
  text: string | null | undefined,
  query: Map<string, number>,
): { score: number; tokens: Set<string> } {
  const tokens = new Set<string>();
  if (!text || query.size === 0) return { score: 0, tokens };
  const counts = new Map<string, number>();
  for (const token of tokenize(text)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  let score = 0;
  for (const [token, hit] of counts) {
    const weight = relatedTokenWeight(token, query);
    if (!weight) continue;
    tokens.add(token);
    score += weight * Math.min(hit, 3);
  }
  return { score, tokens };
}

export function scoreArticleAgainstCourse(
  article: ArticleMatchSource,
  courseTopics: Map<string, number>,
): number {
  if (courseTopics.size === 0) return 0;
  const title = fieldStats(article.title, courseTopics);
  const summary = fieldStats(article.summary, courseTopics);
  const body = fieldStats(article.body, courseTopics);
  const headTokens = new Set([...title.tokens, ...summary.tokens]);
  if (headTokens.size === 0) return 0;
  const strongTitle = [...title.tokens].some(
    (token) => (courseTopics.get(token) ?? 0) >= 4,
  );
  // One weak shared verb is not enough; need breadth or a strong title hit.
  if (headTokens.size < 2 && !strongTitle) return 0;
  return title.score * 4 + summary.score * 2 + body.score;
}

export function rankRelatedArticles<T extends ArticleMatchSource>(
  course: CourseTopicSource,
  articles: T[],
  limit = 3,
): T[] {
  const topics = buildCourseTopicWeights(course);
  const minScore = Math.max(10, Math.ceil(topics.size * 0.25));
  return articles
    .map((article) => ({
      article,
      score: scoreArticleAgainstCourse(article, topics),
    }))
    .filter((row) => row.score >= minScore)
    .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title, "fa"))
    .slice(0, limit)
    .map((row) => row.article);
}
