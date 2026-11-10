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
  return value.replace(/^@+/, "");
}

export class UpdateProfileDto {
  @IsString({ message: "نام نمایشی باید متن باشد." })
  @MinLength(2, { message: "نام نمایشی حداقل ۲ نویسه است." })
  @MaxLength(80, { message: "نام نمایشی بیش از حد بلند است." })
  displayName!: string;

  @IsOptional()
  @Transform(({ value }) => emptyToNull(value))
  @ValidateIf((_, value) => value != null)
  @IsString({ message: "شماره موبایل باید متن باشد." })
  @MaxLength(32, { message: "شماره موبایل بیش از حد بلند است." })
  phone?: string | null;

  @IsOptional()
  @Transform(({ value }) => stripAt(emptyToNull(value)))
  @ValidateIf((_, value) => value != null)
  @IsString({ message: "آیدی تلگرام باید متن باشد." })
  @MaxLength(32, { message: "آیدی تلگرام بیش از حد بلند است." })
  @Matches(/^[A-Za-z][A-Za-z0-9_]{4,31}$/, {
    message: "آیدی تلگرام معتبر نیست.",
  })
  telegramHandle?: string | null;

  @IsOptional()
  @Transform(({ value }) => stripAt(emptyToNull(value)))
  @ValidateIf((_, value) => value != null)
  @IsString({ message: "گیت‌هاب باید متن باشد." })
  @MaxLength(39, { message: "نام کاربری گیت‌هاب بیش از حد بلند است." })
  @Matches(/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/, {
    message: "نام کاربری گیت‌هاب معتبر نیست.",
  })
  githubHandle?: string | null;
}
