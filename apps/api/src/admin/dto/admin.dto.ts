import {
  CourseDiagramKind,
  CourseOfferKind,
  CoursePublicationStatus,
  CouponDiscountType,
  PaymentProvider,
} from "@zharfa/database";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}

export class AdminListQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

export class UpsertCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpsertCourseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  summary?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsEnum(CoursePublicationStatus)
  publicationStatus!: CoursePublicationStatus;

  @IsEnum(CourseOfferKind)
  offerKind!: CourseOfferKind;

  @IsNumber()
  @Min(0)
  priceToman!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtToman?: number | null;

  @IsOptional()
  @IsString()
  levelLabel?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  durationHours?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  lessonCount?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  coverAsset?: string | null;

  @IsOptional()
  @IsString()
  indexLabel?: string | null;

  @IsOptional()
  @IsEnum(CourseDiagramKind)
  diagramKind?: CourseDiagramKind;
}

export class UpsertCouponDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  code!: string;

  @IsEnum(CouponDiscountType)
  discountType!: CouponDiscountType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  percentOff?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountOffToman?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderToman?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountToman?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpsertFaqDto {
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  question!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(4000)
  answer!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpsertArticleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string | null;

  @IsString()
  @MinLength(20)
  @MaxLength(20000)
  body!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  coverAsset?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  readingMinutes?: number | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpsertModuleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpsertLessonDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  durationMinutes?: number | null;

  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;

  @IsOptional()
  @IsString()
  moduleId?: string | null;
}

export class UpdateHomeCmsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  heroEyebrow?: string | null;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  heroTitle!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  heroSubtitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  primaryCtaLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  primaryCtaHref?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  secondaryCtaLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  secondaryCtaHref?: string | null;
}

export class AdminOrdersQueryDto extends AdminListQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}

export class AdminCustomersQueryDto extends AdminListQueryDto {
  @IsOptional()
  @IsString()
  role?: string;
}

export { PaymentProvider };
