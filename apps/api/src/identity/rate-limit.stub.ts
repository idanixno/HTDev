import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";

export const RATE_LIMIT_KEY = "rate_limit_bucket";
export const RateLimitBucket = (bucket: string) =>
  SetMetadata(RATE_LIMIT_KEY, bucket);

type BucketState = { count: number; resetAt: number };

/**
 * In-memory rate-limit stub for local/dev.
 * Replace with Redis-backed limiter before production.
 */
@Injectable()
export class RateLimitStubGuard implements CanActivate {
  private readonly buckets = new Map<string, BucketState>();
  private readonly limit = Number(process.env.AUTH_RATE_LIMIT ?? 30);
  private readonly windowMs = Number(
    process.env.AUTH_RATE_WINDOW_MS ?? 60_000,
  );

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const bucketName =
      this.reflector.get<string>(RATE_LIMIT_KEY, context.getHandler()) ??
      "default";
    const req = context.switchToHttp().getRequest<Request>();
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.ip ??
      "unknown";
    const key = `${bucketName}:${ip}`;
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (existing.count >= this.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.",
          error: "Too Many Requests",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    existing.count += 1;
    return true;
  }
}
