import { IsString, MaxLength, MinLength } from "class-validator";

export class RecoverRequestDto {
  /** email or phone — channel inferred */
  @IsString()
  @MinLength(5)
  @MaxLength(254)
  destination!: string;
}

export class RecoverVerifyDto {
  @IsString()
  @MinLength(1)
  challengeId!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(12)
  code!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
