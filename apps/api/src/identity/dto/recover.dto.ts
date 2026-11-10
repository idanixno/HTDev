import { IsString, MaxLength, MinLength } from "class-validator";

export class RecoverRequestDto {
  /** email or phone — channel inferred */
  @IsString({ message: "مقصد بازیابی باید متن باشد." })
  @MinLength(5, { message: "ایمیل یا شماره موبایل معتبر نیست." })
  @MaxLength(254, { message: "ایمیل یا شماره موبایل بیش از حد بلند است." })
  destination!: string;
}

export class RecoverVerifyDto {
  @IsString({ message: "شناسه بازیابی باید متن باشد." })
  @MinLength(1, { message: "شناسه بازیابی لازم است." })
  challengeId!: string;

  @IsString({ message: "کد بازیابی باید متن باشد." })
  @MinLength(4, { message: "کد بازیابی کوتاه است." })
  @MaxLength(12, { message: "کد بازیابی بیش از حد بلند است." })
  code!: string;

  @IsString({ message: "رمز عبور باید متن باشد." })
  @MinLength(8, { message: "رمز عبور باید حداقل ۸ نویسه باشد." })
  @MaxLength(128, { message: "رمز عبور بیش از حد بلند است." })
  newPassword!: string;
}
