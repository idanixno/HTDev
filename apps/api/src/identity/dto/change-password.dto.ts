import { IsString, MaxLength, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsString({ message: "رمز فعلی باید متن باشد." })
  @MinLength(8, { message: "رمز فعلی باید حداقل ۸ نویسه باشد." })
  @MaxLength(128, { message: "رمز فعلی بیش از حد بلند است." })
  currentPassword!: string;

  @IsString({ message: "رمز جدید باید متن باشد." })
  @MinLength(8, { message: "رمز جدید باید حداقل ۸ نویسه باشد." })
  @MaxLength(128, { message: "رمز جدید بیش از حد بلند است." })
  newPassword!: string;
}
