import { CourseOfferKind } from "@zharfa/database";
import { Transform, Type } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export const COURSE_SORTS = [
  "catalog",
  "newest",
  "price_asc",
  "price_desc",
  "title",
] as const;

export type CourseSort = (typeof COURSE_SORTS)[number];

export class ListCoursesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  category?: string;

  /** Topic hub slug — courses linked via CourseTopic (published topics only). */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  topic?: string;

  @IsOptional()
  @IsEnum(CourseOfferKind)
  offer?: CourseOfferKind;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  level?: string;

  @IsOptional()
  @IsIn(COURSE_SORTS)
  sort?: CourseSort;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  pageSize?: number = 12;
}
