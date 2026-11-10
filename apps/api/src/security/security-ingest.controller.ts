import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { SecurityEventType } from "@zharfa/database";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { SecurityEventsService } from "./security-events.service";

class IngestProbeDto {
  @IsString()
  @MaxLength(500)
  path!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  method?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ip?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  userAgent?: string;
}

/**
 * Internal ingest for Edge middleware probe logging.
 * Auth: x-internal-token must match INTERNAL_SECURITY_TOKEN (no SESSION_SECRET fallback).
 */
@Controller("internal/security")
export class SecurityIngestController {
  constructor(private readonly security: SecurityEventsService) {}

  @Post("probe")
  async probe(
    @Headers("x-internal-token") token: string | undefined,
    @Body() body: IngestProbeDto,
  ) {
    const expected = process.env.INTERNAL_SECURITY_TOKEN?.trim();
    if (!expected || token !== expected) {
      throw new UnauthorizedException();
    }
    if (!this.security.isSuspiciousPath(body.path)) {
      return { ok: true, recorded: false };
    }
    await this.security.record({
      type: SecurityEventType.SUSPICIOUS_PATH,
      path: body.path,
      method: body.method,
      ip: body.ip,
      userAgent: body.userAgent,
    });
    return { ok: true, recorded: true };
  }
}
