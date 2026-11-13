import {
  CourseDiagramKind,
  CourseOfferKind,
  CoursePublicationStatus,
  CouponDiscountType,
  PaymentProvider,
  TopicPublicationStatus,
  TopicRelationType,
} from "@zharfa/database";
import { Type } from "class-transformer";
import {
  Allow,
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
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
  @Type(() => Number)
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

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceToman!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  compareAtToman?: number | null;

  @IsOptional()
  @IsString()
  levelLabel?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  durationHours?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lessonCount?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  coverAsset?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  previewAsset?: string | null;

  @IsOptional()
  @IsString()
  indexLabel?: string | null;

  @IsOptional()
  @IsEnum(CourseDiagramKind)
  diagramKind?: CourseDiagramKind;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImage?: string | null;

  @IsOptional()
  @IsBoolean()
  noIndex?: boolean;
}

export class UpsertCouponDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  code!: string;

  @IsEnum(CouponDiscountType)
  discountType!: CouponDiscountType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  percentOff?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amountOffToman?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderToman?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDiscountToman?: number | null;

  @IsOptional()
  @Type(() => Number)
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
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpsertCoursePurchaseNoteDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  body!: string;

  @IsOptional()
  @IsString()
  courseId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class CoursePurchaseNotesQueryDto {
  /** `global` = only shared notes; omit/`course` with courseId = exclusive. */
  @IsOptional()
  @IsString()
  scope?: "global" | "course";

  @IsOptional()
  @IsString()
  courseId?: string;
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
  @MaxLength(60000)
  body!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverAsset?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImage?: string | null;

  @IsOptional()
  @IsBoolean()
  noIndex?: boolean;

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
  @MaxLength(500)
  previewAsset?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  videoAsset?: string | null;

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

  @IsOptional()
  @IsBoolean()
  announcementEnabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  announcementText?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  announcementHref?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  announcementCtaLabel?: string | null;
}

export class UpdatePathsCmsDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  lead?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string | null;
}

export class UpdateFooterCmsDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  brandName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  brandTagline?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  brandKicker?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(900)
  footerBlurb?: string | null;

  @IsOptional()
  @Allow()
  headerLinks?: unknown;

  @IsOptional()
  @Allow()
  footerGroups?: unknown;

  @IsOptional()
  @Allow()
  mobileGroups?: unknown;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  guestCtaLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  guestCtaHref?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  authedCtaLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  authedCtaHref?: string | null;

  @IsOptional()
  @IsBoolean()
  showCart?: boolean;

  @IsOptional()
  @IsBoolean()
  showThemeToggle?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  trustsLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  mobileMenuTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  mobileMenuLine?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(12000)
  enamadHtml?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(12000)
  paymentGatewayHtml?: string | null;
}

export class AdminOrdersQueryDto extends AdminListQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  /** SpotPlayer license pipeline — orthogonal to OrderStatus. */
  @IsOptional()
  @IsString()
  licenseStatus?: string;
}

export class UpdateOrderStatusDto {
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  status!: string;
}

export class AdminCustomersQueryDto extends AdminListQueryDto {
  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdatePathStepDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(80)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60000)
  body?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImage?: string | null;

  @IsOptional()
  @IsBoolean()
  noIndex?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  courseId?: string | null;
}

export class UpsertLearningPathDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
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

  @IsOptional()
  @IsString()
  @MaxLength(60000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverAsset?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class CreatePathStepDto extends UpdatePathStepDto {}

export class UpsertTopicDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60000)
  introContent?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  h1?: string | null;

  @IsOptional()
  @IsString()
  parentTopicId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  canonicalUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  indexable?: boolean;

  @IsEnum(TopicPublicationStatus)
  status!: TopicPublicationStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  courseIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  articleIds?: string[];
}

export class TopicRelationDto {
  @IsString()
  toTopicId!: string;

  @IsOptional()
  @IsEnum(TopicRelationType)
  relationType?: TopicRelationType;
}

export { PaymentProvider };
