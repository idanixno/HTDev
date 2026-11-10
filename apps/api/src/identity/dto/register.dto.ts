import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @IsString({ message: "نام کاربری باید متن باشد." })
  @MinLength(3, { message: "نام کاربری حداقل ۳ نویسه است." })
  @MaxLength(32, { message: "نام کاربری حداکثر ۳۲ نویسه است." })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_-]{2,31}$/, {
    message:
      "نام کاربری باید با حرف لاتین شروع شود و فقط حرف، عدد، _ و - داشته باشد.",
  })
  username!: string;

  @IsString({ message: "ایمیل باید متن باشد." })
  @MinLength(5, { message: "ایمیل معتبر نیست." })
  @MaxLength(254, { message: "ایمیل بیش از حد بلند است." })
  email!: string;

  @IsString({ message: "شماره موبایل باید متن باشد." })
  @MinLength(10, { message: "شماره موبایل معتبر نیست." })
  @MaxLength(32, { message: "شماره موبایل بیش از حد بلند است." })
  phone!: string;

  /** Optional at signup; defaults to username. Editable later in profile. */
  @IsOptional()
  @IsString({ message: "نام نمایشی باید متن باشد." })
  @MinLength(2, { message: "نام نمایشی حداقل ۲ نویسه است." })
  @MaxLength(80, { message: "نام نمایشی بیش از حد بلند است." })
  displayName?: string;

  @IsString({ message: "رمز عبور باید متن باشد." })
  @MinLength(8, { message: "رمز عبور باید حداقل ۸ نویسه باشد." })
  @MaxLength(128, { message: "رمز عبور بیش از حد بلند است." })
  password!: string;
}
