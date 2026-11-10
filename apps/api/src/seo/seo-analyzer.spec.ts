import { describe, expect, it } from "vitest";
import { analyzeContent } from "./seo-analyzer";

describe("analyzeContent", () => {
  it("flags missing meta and thin course copy as critical/warning", () => {
    const result = analyzeContent({
      entityType: "COURSE",
      title: "تست",
      slug: "ab",
      seoTitle: "",
      seoDescription: "",
      summary: "",
      body: "",
      published: true,
    });
    expect(result.scores.overall).toBeLessThan(85);
    expect(result.issues.some((i) => i.id === "desc-missing")).toBe(true);
    expect(result.issues.some((i) => i.id === "slug-short")).toBe(true);
    expect(result.diagnostics.titleIdeal).toEqual([30, 60]);
    expect(result.diagnostics.descriptionIdeal).toEqual([120, 160]);
  });

  it("scores a reasonably complete article higher", () => {
    const body = [
      "## مقدمه",
      "این یک متن نمونه برای پوشش موضوع مقاله است که طول کافی دارد تا از آستانهٔ نازک بودن رد شود و چند جملهٔ اضافه برای اطمینان.",
      "## بدنه",
      "ادامهٔ محتوا با جزئیات بیشتر دربارهٔ موضوع و لینک داخلی [دوره](/courses/demo).",
      "![کاور](/x.png)",
      "",
      ...Array.from({ length: 40 }, () =>
        "جملهٔ تکمیلی برای رسیدن به حجم واژهٔ استاندارد مقاله در تحلیل SEO و پوشش عمیق‌تر موضوع.",
      ),
    ].join("\n");
    const result = analyzeContent({
      entityType: "ARTICLE",
      title: "امنیت API در عمل برای مهندسان",
      slug: "api-security-in-practice",
      seoTitle: "امنیت API در عمل؛ راهنمای مهندس بک‌اند",
      seoDescription:
        "در این یادداشت الگوهای واقعی احراز هویت، محدودیت نرخ و طراحی قرارداد امن برای API را بررسی می‌کنیم.",
      body,
      coverAsset: "/artwork/x.svg",
      coverAlt: "نمودار API",
      published: true,
    });
    expect(result.scores.overall).toBeGreaterThan(75);
    expect(result.issues.some((i) => i.severity === "critical")).toBe(false);
    expect(result.diagnostics.bodyWords).toBeGreaterThan(250);
    expect(result.diagnostics.h2Count).toBeGreaterThanOrEqual(2);
    expect(result.diagnostics.internalLinks).toBe(1);
    expect(result.diagnostics.imageCount).toBe(1);
    expect(result.diagnostics.imagesMissingAlt).toBe(0);
  });

  it("penalizes title/description outside SERP ideal windows", () => {
    const short = analyzeContent({
      entityType: "PATH_STEP",
      title: "گام اول مسیر یادگیری",
      slug: "first-step",
      seoTitle: "کوتاه",
      seoDescription: "توضیح خیلی کوتاه",
      body: "## بخش\n" + "متن کافی برای گام. ".repeat(40),
      published: true,
    });
    expect(short.diagnostics.titleLength).toBeLessThan(30);
    expect(short.diagnostics.descriptionLength).toBeLessThan(120);
    expect(short.scores.metadata).toBeLessThan(90);
    expect(short.issues.some((i) => i.id === "title-short")).toBe(true);
    expect(short.issues.some((i) => i.id === "desc-short")).toBe(true);

    const idealTitle = "راهنمای کامل امنیت API برای تیم بک‌اند";
    const idealDesc =
      "در این گام الگوهای احراز هویت، محدودیت نرخ و قرارداد امن API را مرحله‌به‌مرحله پیاده می‌کنید تا سرویس پایدار و قابل‌اعتماد بماند.";
    const good = analyzeContent({
      entityType: "PATH_STEP",
      title: "امنیت API",
      slug: "api-security",
      seoTitle: idealTitle,
      seoDescription: idealDesc,
      body:
        "## مقدمه\n" +
        "متن آموزشی کافی برای پوشش گام. ".repeat(30) +
        "\n## تمرین\n" +
        "ادامه با جزئیات بیشتر و لینک [دوره](/courses/demo).\n" +
        "![نمودار](/x.png)",
      ogImage: "/og.png",
      published: true,
    });
    expect(good.diagnostics.titleLength).toBeGreaterThanOrEqual(30);
    expect(good.diagnostics.titleLength).toBeLessThanOrEqual(60);
    expect(good.diagnostics.descriptionLength).toBeGreaterThanOrEqual(120);
    expect(good.diagnostics.descriptionLength).toBeLessThanOrEqual(160);
    expect(good.scores.metadata).toBeGreaterThan(85);
  });
});
