import { describe, expect, it } from "vitest";
import {
  rankRelatedArticles,
  scoreArticleAgainstCourse,
  buildCourseTopicWeights,
  tokenize,
} from "./related-articles";

describe("related articles ranking", () => {
  const course = {
    title: "ری‌اکت پیشرفته با Next.js",
    summary: "ساخت اپلیکیشن‌های سمت سرور با ری‌اکت و نکست",
    description: "در این دوره رندر سمت سرور، کش و مسیرهای اپ را کار می‌کنیم.",
    categoryTitle: "فرانت‌اند",
    levelLabel: "پیشرفته",
    modules: [
      {
        title: "رندر سمت سرور",
        summary: null,
        lessons: [
          { title: "آشنایی با RSC", summary: null },
          { title: "کش داده‌ها در Next", summary: null },
        ],
      },
    ],
  };

  it("tokenizes Persian text and drops stopwords", () => {
    expect(tokenize("ری‌اکت در Next.js و ساخت اپ")).toEqual(
      expect.arrayContaining(["ری", "اکت", "next", "js", "ساخت", "اپ"]),
    );
    expect(tokenize("این برای آن است")).toEqual([]);
  });

  it("scores topical articles above unrelated ones", () => {
    const topics = buildCourseTopicWeights(course);
    const related = scoreArticleAgainstCourse(
      {
        id: "1",
        title: "راهنمای رندر سمت سرور در Next.js",
        summary: "مقایسه RSC و کش داده در ری‌اکت",
        body: "در اپلیکیشن‌های فرانت‌اند، رندر سمت سرور و کش اهمیت دارد.",
      },
      topics,
    );
    const unrelated = scoreArticleAgainstCourse(
      {
        id: "2",
        title: "آشنایی با زرین‌پال",
        summary: "پرداخت آنلاین در ایران",
        body: "درگاه پرداخت و تسویه حساب فروشگاه.",
      },
      topics,
    );
    expect(related).toBeGreaterThan(unrelated);
  });

  it("returns only articles that clear the relevance floor", () => {
    const articles = [
      {
        id: "a",
        title: "Next.js و رندر سمت سرور",
        summary: "ری‌اکت پیشرفته",
        body: "کش داده‌ها در مسیرهای اپ فرانت‌اند",
      },
      {
        id: "b",
        title: "کاتالوگ دوره‌ها",
        summary: "لیست عمومی",
        body: "صفحهٔ اصلی فروشگاه آموزشی",
      },
    ];
    expect(rankRelatedArticles(course, articles, 3).map((row) => row.id)).toEqual([
      "a",
    ]);
  });
});
