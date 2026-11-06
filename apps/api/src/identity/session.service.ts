import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
export const SESSION_COOKIE_NAME = "zharfa_session";

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  createRawToken(): string {
    return randomBytes(32).toString("base64url");
  }

  hash(rawToken: string): string {
    return hashToken(rawToken);
  }

  async createSession(input: {
    userId: string;
    userAgent?: string | null;
    ipAddress?: string | null;
  }): Promise<{ rawToken: string; expiresAt: Date; sessionId: string }> {
    const rawToken = this.createRawToken();
    const tokenHash = this.hash(rawToken);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const session = await this.prisma.session.create({
      data: {
        userId: input.userId,
        tokenHash,
        expiresAt,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    });

    return { rawToken, expiresAt, sessionId: session.id };
  }

  async findValidSession(rawToken: string) {
    if (!rawToken) return null;
    const tokenHash = this.hash(rawToken);
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!session) return null;
    if (session.revokedAt) return null;
    if (session.expiresAt.getTime() < Date.now()) return null;
    return session;
  }

  async revokeByRawToken(rawToken: string): Promise<void> {
    const tokenHash = this.hash(rawToken);
    await this.prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Constant-time compare of two raw tokens (rarely needed). */
  tokensEqual(a: string, b: string): boolean {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  }
}
