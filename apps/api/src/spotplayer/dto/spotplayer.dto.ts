import {
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";
import { SpotPlayerLicenseStatus } from "@zharfa/database";

export class UpdateSpotPlayerSettingsDto {
  @IsOptional()
  @IsBoolean()
  technicalEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  testMode?: boolean;

  /** Plain API key — stored encrypted; never echoed back in full. */
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(512)
  apiKey?: string;

  @IsOptional()
  @IsBoolean()
  clearApiKey?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  licenseEndpoint?: string | null;
}

export class UpsertCourseMappingDto {
  @IsString()
  @MinLength(1)
  courseId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  spotPlayerCourseId!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class GrantFreeAccessDto {
  @IsString()
  @MinLength(1)
  courseSlug!: string;
}

export class AdminLicenseQueryDto {
  @IsOptional()
  @IsString()
  status?: SpotPlayerLicenseStatus;
}
