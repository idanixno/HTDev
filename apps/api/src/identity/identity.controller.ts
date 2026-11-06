import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { IdentityService } from "./identity.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RecoverRequestDto, RecoverVerifyDto } from "./dto/recover.dto";
import {
  AuthGuard,
  extractSessionToken,
  type AuthedRequest,
} from "./auth.guard";
import { RateLimitBucket, RateLimitStubGuard } from "./rate-limit.stub";
import { SESSION_COOKIE_NAME } from "./session.service";

function clientMeta(req: Request) {
  return {
    userAgent: req.headers["user-agent"] ?? null,
    ipAddress:
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.ip ??
      null,
  };
}

function setSessionCookie(
  res: Response,
  token: string,
  expiresAt: Date,
): void {
  const secure = process.env.NODE_ENV === "production";
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

@Controller("identity")
@UseGuards(RateLimitStubGuard)
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Post("register")
  @RateLimitBucket("register")
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.identity.register(dto, clientMeta(req));
    setSessionCookie(res, result.sessionToken, result.expiresAt);
    return {
      user: result.user,
      sessionToken: result.sessionToken,
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  @Post("login")
  @HttpCode(200)
  @RateLimitBucket("login")
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.identity.login(dto, clientMeta(req));
    setSessionCookie(res, result.sessionToken, result.expiresAt);
    return {
      user: result.user,
      sessionToken: result.sessionToken,
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  @Post("logout")
  @HttpCode(200)
  @RateLimitBucket("logout")
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.identity.logout(extractSessionToken(req));
    clearSessionCookie(res);
    return { ok: true };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() req: AuthedRequest) {
    return { user: req.user };
  }

  @Post("recover/request")
  @HttpCode(200)
  @RateLimitBucket("recover_request")
  async recoverRequest(@Body() dto: RecoverRequestDto) {
    return this.identity.requestRecovery(dto.destination);
  }

  @Post("recover/confirm")
  @HttpCode(200)
  @RateLimitBucket("recover_confirm")
  async recoverConfirm(@Body() dto: RecoverVerifyDto) {
    return this.identity.confirmRecovery({
      challengeId: dto.challengeId,
      code: dto.code,
      newPassword: dto.newPassword,
    });
  }
}
