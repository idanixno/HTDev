import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { PaymentProvider } from "@zharfa/database";

export class StartCheckoutDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  courseSlug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  couponCode?: string;

  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;
}

export class ValidateCouponDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  courseSlug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  couponCode!: string;
}
