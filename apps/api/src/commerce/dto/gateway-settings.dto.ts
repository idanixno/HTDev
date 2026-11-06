import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { PaymentProvider } from "@zharfa/database";

export class UpdateGatewaySettingDto {
  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @IsOptional()
  @IsBoolean()
  technicalEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  checkoutVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  sandboxMode?: boolean;
}
