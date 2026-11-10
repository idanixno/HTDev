import { SeoEntityType, SeoSuggestionDecision } from "@zharfa/database";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class SeoAnalyzeDto {
  @IsIn(["COURSE", "ARTICLE", "PATH_STEP"])
  entityType!: "COURSE" | "ARTICLE" | "PATH_STEP";

  @IsString()
  @MaxLength(300)
  title!: string;

  @IsString()
  @MaxLength(120)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200_000)
  body?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  h1?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverAsset?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  coverAlt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImage?: string | null;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  noIndex?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  published?: boolean;
}

export class SeoSuggestDto extends SeoAnalyzeDto {
  @IsIn([
    "seo_title",
    "seo_description",
    "slug",
    "outline",
    "intro",
    "alts",
    "faq",
  ])
  action!:
    | "seo_title"
    | "seo_description"
    | "slug"
    | "outline"
    | "intro"
    | "alts"
    | "faq";
}

export class SeoDecisionDto {
  @IsEnum(SeoEntityType)
  entityType!: SeoEntityType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsString()
  @MaxLength(80)
  action!: string;

  @IsEnum(SeoSuggestionDecision)
  decision!: SeoSuggestionDecision;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  summary?: string;
}
