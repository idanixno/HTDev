import { Transform } from "class-transformer";
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

function emptyToNull(value: unknown): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

function stripAt(value: string | null): string | null {
  if (!value) return null;
  const stripped = value.replace(/^@+/, "").trim();
  return stripped || null;
}

function normalizeLinkedin(value: string | null): string | null {
  if (!value) return null;
  const normalized = value
    .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")
    .replace(/\/+$/, "")
    .trim();
  return normalized || null;
}

function normalizeStackOverflow(value: string | null): string | null {
  if (!value) return null;
  const normalized = value
    .replace(/^https?:\/\/(www\.)?stackoverflow\.com\/users\//i, "")
    .replace(/\/+$/, "")
    .trim();
  return normalized || null;
}

export class UpdateProfileDto {
  @IsString({ message: "نام نمایشی باید متن باشد." })
  @MinLength(2, { message: "نام نمایشی حداقل ۲ نویسه است." })
  @MaxLength(80, { message: "نام نمایشی بیش از حد بلند است." })
  displayName!: string;

  @IsOptional()
  @Transform(({ value }) => stripAt(emptyToNull(value)))
  @ValidateIf((_, value) => typeof value === "string" && value.length > 0)
  @IsString({ message: "آیدی تلگرام باید متن باشد." })
  @MaxLength(32, { message: "آیدی تلگرام بیش از حد بلند است." })
  @Matches(/^[A-Za-z][A-Za-z0-9_]{4,31}$/, {
    message: "آیدی تلگرام معتبر نیست.",
  })
  telegramHandle?: string | null;

  @IsOptional()
  @Transform(({ value }) => stripAt(emptyToNull(value)))
  @ValidateIf((_, value) => typeof value === "string" && value.length > 0)
  @IsString({ message: "گیت‌هاب باید متن باشد." })
  @MaxLength(39, { message: "نام کاربری گیت‌هاب بیش از حد بلند است." })
  @Matches(/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/, {
    message: "نام کاربری گیت‌هاب معتبر نیست.",
  })
  githubHandle?: string | null;

  @IsOptional()
  @Transform(({ value }) => normalizeLinkedin(emptyToNull(value)))
  @ValidateIf((_, value) => typeof value === "string" && value.length > 0)
  @IsString({ message: "لینکدین باید متن باشد." })
  @MaxLength(100, { message: "نام کاربری لینکدین بیش از حد بلند است." })
  @Matches(/^[A-Za-z0-9](?:[A-Za-z0-9_-]{0,98}[A-Za-z0-9])?$/, {
    message: "نام کاربری لینکدین معتبر نیست.",
  })
  linkedinHandle?: string | null;

  @IsOptional()
  @Transform(({ value }) => normalizeStackOverflow(emptyToNull(value)))
  @ValidateIf((_, value) => typeof value === "string" && value.length > 0)
  @IsString({ message: "استک‌اورفلو باید متن باشد." })
  @MaxLength(80, { message: "شناسه استک‌اورفلو بیش از حد بلند است." })
  @Matches(/^\d+(?:\/[A-Za-z0-9_-]+)?$/, {
    message: "شناسه استک‌اورفلو معتبر نیست.",
  })
  stackOverflowHandle?: string | null;
}
