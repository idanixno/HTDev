import { IntegrationProvider } from "@zharfa/database";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";

export class UpsertIntegrationDto {
  @IsEnum(IntegrationProvider)
  provider!: IntegrationProvider;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  secret?: string | null;

  @IsOptional()
  @IsBoolean()
  clearSecret?: boolean;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown> | null;

  @IsOptional()
  @IsBoolean()
  clearOAuthTokens?: boolean;
}

export class TestIntegrationDto {
  @IsEnum(IntegrationProvider)
  provider!: IntegrationProvider;
}
