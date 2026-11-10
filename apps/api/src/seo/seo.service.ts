import {
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import {
  CoursePublicationStatus,
  SeoEntityType,
  SeoSuggestionDecision,
} from "@zharfa/database";
import { AiNotConfiguredError } from "../ai/ai-provider";
import { AiRouterService } from "../ai/ai-router.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  analyzeContent,
  type SeoAnalyzeInput,
  type SeoAnalyzeResult,
} from "./seo-analyzer";

const suggestBuckets = new Map<string, { count: number; resetAt: number }>();

@Injectable()
export class SeoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiRouterService,
  ) {}

  analyze(input: SeoAnalyzeInput): SeoAnalyzeResult {
    return analyzeContent(input);
  }

  async aiStatus() {
    return {
      configured: await this.ai.isConfigured(),
      provider: "openai",
    };
  }

  async overview() {
    const [courses, articles, coursesMissingMeta, articlesMissingMeta] =
      await Promise.all([
        this.prisma.course.count(),
        this.prisma.article.count(),
        this.prisma.course.count({
          where: {
            OR: [{ seoTitle: null }, { seoDescription: null }, { seoTitle: "" }, { seoDescription: "" }],
          },
        }),
        this.prisma.article.count({
          where: {
            OR: [{ seoTitle: null }, { seoDescription: null }, { seoTitle: "" }, { seoDescription: "" }],
          },
        }),
      ]);

    const publishedNoIndexCourses = await this.prisma.course.count({
      where: {
        publicationStatus: CoursePublicationStatus.PUBLISHED,
        noIndex: true,
      },
    });
    const publishedNoIndexArticles = await this.prisma.article.count({
      where: { published: true, noIndex: true },
    });

    return {
      courses,
      articles,
      coursesMissingMeta,
      articlesMissingMeta,
      publishedNoIndex: publishedNoIndexCourses + publishedNoIndexArticles,
      sitemapPath: "/sitemap.xml",
      robotsPath: "/robots.txt",
    };
  }

  async contentAudit(limit = 40) {
    const [courses, articles] = await Promise.all([
      this.prisma.course.findMany({
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          description: true,
          seoTitle: true,
          seoDescription: true,
          coverAsset: true,
          noIndex: true,
          publicationStatus: true,
        },
      }),
      this.prisma.article.findMany({
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          body: true,
          seoTitle: true,
          seoDescription: true,
          coverAsset: true,
          noIndex: true,
          published: true,
        },
      }),
    ]);

    return {
      courses: courses.map((c) => {
        const analysis = analyzeContent({
          entityType: "COURSE",
          title: c.title,
          slug: c.slug,
          seoTitle: c.seoTitle,
          seoDescription: c.seoDescription,
          summary: c.summary,
          body: c.description,
          coverAsset: c.coverAsset,
          noIndex: c.noIndex,
          published: c.publicationStatus === CoursePublicationStatus.PUBLISHED,
        });
        return {
          id: c.id,
          type: "COURSE" as const,
          title: c.title,
          slug: c.slug,
          href: `/admin/courses/${c.id}`,
          score: analysis.scores.overall,
          critical: analysis.issues.filter((i) => i.severity === "critical")
            .length,
        };
      }),
      articles: articles.map((a) => {
        const analysis = analyzeContent({
          entityType: "ARTICLE",
          title: a.title,
          slug: a.slug,
          seoTitle: a.seoTitle,
          seoDescription: a.seoDescription,
          summary: a.summary,
          body: a.body,
          coverAsset: a.coverAsset,
          noIndex: a.noIndex,
          published: a.published,
        });
        return {
          id: a.id,
          type: "ARTICLE" as const,
          title: a.title,
          slug: a.slug,
          href: `/admin/journal/${a.id}`,
          score: analysis.scores.overall,
          critical: analysis.issues.filter((i) => i.severity === "critical")
            .length,
        };
      }),
    };
  }

  async suggest(
    actorId: string,
    input: SeoAnalyzeInput & {
      action:
        | "seo_title"
        | "seo_description"
        | "slug"
        | "outline"
        | "intro"
        | "alts"
        | "faq";
    },
  ) {
    this.assertSuggestRate(actorId);
    const analysis = analyzeContent(input);

    try {
      const result = await this.ai.completeJson({
        system: [
          "You are an SEO assistant for a Persian (fa-IR) technical education site named ژرفا.",
          "Return ONLY valid JSON. Do not invent course features, prices, reviews, or statistics.",
          "Preserve the author's meaning and factual claims. Prefer clear Persian.",
          "Fields: suggestion (string), alternatives (string[] optional), rationale (string).",
        ].join(" "),
        user: JSON.stringify({
          action: input.action,
          entityType: input.entityType,
          title: input.title,
          slug: input.slug,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          summary: input.summary,
          bodyExcerpt: (input.body ?? "").slice(0, 4000),
          analysis: {
            scores: analysis.scores,
            issues: analysis.issues.slice(0, 12),
          },
        }),
        maxTokens: 700,
      });

      const parsed = (result.parsed ?? {}) as {
        suggestion?: string;
        alternatives?: string[];
        rationale?: string;
      };

      await this.prisma.seoSuggestionLog.create({
        data: {
          entityType: input.entityType as SeoEntityType,
          action: input.action,
          actorId,
          summary: `AI ${input.action}`,
        },
      });

      return {
        id: `${input.action}-${Date.now()}`,
        action: input.action,
        suggestion: parsed.suggestion ?? "",
        alternatives: Array.isArray(parsed.alternatives)
          ? parsed.alternatives.filter((x) => typeof x === "string")
          : [],
        rationale: parsed.rationale ?? "",
        model: result.model,
        analysis,
      };
    } catch (error) {
      if (error instanceof AiNotConfiguredError) {
        throw new HttpException(
          {
            code: "AI_NOT_CONFIGURED",
            message:
              "کلید OpenAI تنظیم نشده. از پنل یکپارچه‌سازی‌ها اضافه کنید.",
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw error;
    }
  }

  async logDecision(
    actorId: string,
    input: {
      entityType: SeoEntityType;
      entityId?: string;
      action: string;
      decision: SeoSuggestionDecision;
      summary?: string;
    },
  ) {
    await this.prisma.seoSuggestionLog.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        decision: input.decision,
        actorId,
        summary: input.summary?.slice(0, 300),
      },
    });
    return { ok: true };
  }

  private assertSuggestRate(actorId: string) {
    const now = Date.now();
    const windowMs = 60_000;
    const max = 20;
    const bucket = suggestBuckets.get(actorId);
    if (!bucket || bucket.resetAt < now) {
      suggestBuckets.set(actorId, { count: 1, resetAt: now + windowMs });
      return;
    }
    if (bucket.count >= max) {
      throw new HttpException(
        {
          code: "RATE_LIMITED",
          message: "تعداد درخواست‌های AI زیاد است؛ کمی صبر کنید.",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    bucket.count += 1;
  }
}
