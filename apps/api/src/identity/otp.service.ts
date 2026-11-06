import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { OtpChannel, OtpPurpose } from "@zharfa/database";
import { PrismaService } from "../prisma/prisma.service";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_LENGTH = 6;

function hashOtp(code: string, pepper: string): string {
  return createHash("sha256")
    .update(`${pepper}:${code}`)
    .digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  private pepper(): string {
    return (
      process.env.OTP_PEPPER ??
      process.env.SESSION_SECRET ??
      "dev-otp-pepper-change-me"
    );
  }

  generateCode(): string {
    const max = 10 ** OTP_LENGTH;
    const n = randomInt(0, max);
    return String(n).padStart(OTP_LENGTH, "0");
  }

  hashCode(code: string): string {
    return hashOtp(code, this.pepper());
  }

  verifyCodeHash(code: string, codeHash: string): boolean {
    return safeEqualHex(this.hashCode(code), codeHash);
  }

  async createChallenge(input: {
    userId?: string | null;
    channel: OtpChannel;
    purpose: OtpPurpose;
    destinationNormalized: string;
  }): Promise<{ challengeId: string; code: string; expiresAt: Date }> {
    const code = this.generateCode();
    const codeHash = this.hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Invalidate prior unused challenges for same destination+purpose+channel
    await this.prisma.otpChallenge.updateMany({
      where: {
        destinationNormalized: input.destinationNormalized,
        purpose: input.purpose,
        channel: input.channel,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });

    const challenge = await this.prisma.otpChallenge.create({
      data: {
        userId: input.userId ?? null,
        channel: input.channel,
        purpose: input.purpose,
        destinationNormalized: input.destinationNormalized,
        codeHash,
        expiresAt,
      },
    });

    return { challengeId: challenge.id, code, expiresAt };
  }

  /**
   * Consume a valid OTP (single-use). Returns the challenge row on success.
   */
  async consumeChallenge(input: {
    challengeId: string;
    code: string;
    purpose: OtpPurpose;
  }) {
    const challenge = await this.prisma.otpChallenge.findUnique({
      where: { id: input.challengeId },
    });

    if (!challenge) {
      return { ok: false as const, reason: "not_found" as const };
    }
    if (challenge.purpose !== input.purpose) {
      return { ok: false as const, reason: "purpose_mismatch" as const };
    }
    if (challenge.consumedAt) {
      return { ok: false as const, reason: "already_used" as const };
    }
    if (challenge.expiresAt.getTime() < Date.now()) {
      return { ok: false as const, reason: "expired" as const };
    }
    if (challenge.attemptCount >= challenge.maxAttempts) {
      return { ok: false as const, reason: "max_attempts" as const };
    }

    const match = this.verifyCodeHash(input.code, challenge.codeHash);
    if (!match) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attemptCount: { increment: 1 } },
      });
      return { ok: false as const, reason: "invalid_code" as const };
    }

    const consumed = await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });

    return { ok: true as const, challenge: consumed };
  }
}
