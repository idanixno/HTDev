import { IsString, MinLength, MaxLength } from "class-validator";

export class JoinWaitlistDto {
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone!: string;
}
