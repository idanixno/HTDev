import { IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  /** username | email | phone */
  @IsString({ message: "شناسه ورود باید متن باشد." })
  @MinLength(3, { message: "شناسه ورود حداقل ۳ نویسه است." })
  @MaxLength(254, { message: "شناسه ورود بیش از حد بلند است." })
  identifier!: string;

  @IsString({ message: "رمز عبور باید متن باشد." })
  @MinLength(8, { message: "رمز عبور باید حداقل ۸ نویسه باشد." })
  @MaxLength(128, { message: "رمز عبور بیش از حد بلند است." })
  password!: string;
}
