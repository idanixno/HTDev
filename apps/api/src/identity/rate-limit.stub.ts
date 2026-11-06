import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleDestroy,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import Redis from "ioredis";

export const RATE_LIMIT_KEY = "rate_limit_bucket";
export const RateLimitBucket = (bucket: string) =>
  SetMetadata(RATE_LIMIT_KEY, bucket);

type BucketState = { count: number; resetAt: number };

/**
 * Auth rate limiter: Redis when REDIS_URL is reachable, otherwise in-memory.
 * In-memory is the local/dev default and is process-local (not multi-instance safe).
 * Documented as stub-grade for production until Redis is required in deploy.
 */
@Injectable()
export class RateLimitStubGuard implements CanActivate, OnModuleDestroy {
  private readonly logger = new Logger(RateLimitStubGuard.name);
  private readonly memory = new Map<string, BucketState>();
  private readonly limit = Number(process.env.AUTH_RATE_LIMIT ?? 30);
  private readonly windowMs = Number(
    process.env.AUTH_RATE_WINDOW_MS ?? 60_000,
  );
  private redis: Redis | null = null;
  private redisReady = false;

  constructor(private readonly reflector: Reflector) {
    const url = process.env.REDIS_URL?.trim();
    if (!url) {
      this.logger.log("Auth rate limit: in-memory (REDIS_URL unset)");
      return;
    }
    try {
      this.redis = new Redis(url, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        lazyConnect: true,
      });
      void this.redis
        .connect()
        .then(() => {
          this.redisReady = true;
          this.logger.log("Auth rate limit: Redis-backed");
        })
        .catch((err: unknown) => {
          this.redisReady = false;
          this.logger.warn(
            `Auth rate limit: Redis unavailable, falling back to memory (${
              err instanceof Error ? err.message : "error"
            })`,
          );
        });
    } catch (err) {
      this.redis = null;
      this.logger.warn(
        `Auth rate limit: Redis init failed, using memory (${
          err instanceof Error ? err.message : "error"
        })`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch {
        this.redis.disconnect();
      }
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const bucketName =
      this.reflector.get<string>(RATE_LIMIT_KEY, context.getHandler()) ??
      "default";
    const req = context.switchToHttp().getRequest<Request>();
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
      req.ip ??
      "unknown";
    const key = `zharfa:rl:${bucketName}:${ip}`;

    if (this.redis && this.redisReady) {
      try {
        return await this.hitRedis(key);
      } catch (err) {
        this.logger.warn(
          `Auth rate limit Redis error, memory fallback (${
            err instanceof Error ? err.message : "error"
          })`,
        );
      }
    }

    return this.hitMemory(key);
  }

  private async hitRedis(key: string): Promise<boolean> {
    const redis = this.redis!;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.pexpire(key, this.windowMs);
    }
    if (count > this.limit) {
      throwTooMany();
    }
    return true;
  }

  private hitMemory(key: string): boolean {
    const now = Date.now();
    const existing = this.memory.get(key);

    if (!existing || existing.resetAt <= now) {
      this.memory.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (existing.count >= this.limit) {
      throwTooMany();
    }

    existing.count += 1;
    return true;
  }
}

function throwTooMany(): never {
  throw new HttpException(
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.",
      error: "Too Many Requests",
    },
    HttpStatus.TOO_MANY_REQUESTS,
  );
}
