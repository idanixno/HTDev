import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { OtpChannel, OtpPurpose, UserRole } from "@zharfa/database";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./password.service";
import { SessionService } from "./session.service";
import { OtpService } from "./otp.service";
import {
  classifyIdentifier,
  isValidEmail,
  isValidUsername,
  normalizeEmail,
  normalizePhone,
  normalizeUsername,
} from "./normalization";
import type { RegisterDto } from "./dto/register.dto";
import type { LoginDto } from "./dto/login.dto";
import {
  MESSAGING_PROVIDER,
  type MessagingProvider,
} from "./messaging/messaging.types";
import { toPublicUser, type PublicUser } from "./public-user";

const GENERIC_RECOVER_MESSAGE =
  "اگر حسابی با این مشخصات وجود داشته باشد، کد بازیابی ارسال شد.";

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly otp: OtpService,
    @Inject(MESSAGING_PROVIDER)
    private readonly messaging: MessagingProvider,
  ) {}

  async register(
    dto: RegisterDto,
    meta: { userAgent?: string | null; ipAddress?: string | null },
  ): Promise<{ user: PublicUser; sessionToken: string; expiresAt: Date }> {
    if (!isValidUsername(dto.username)) {
      throw new ConflictException("نام کاربری معتبر نیست.");
    }
    if (!isValidEmail(dto.email)) {
      throw new ConflictException("ایمیل معتبر نیست.");
    }

    const usernameNormalized = normalizeUsername(dto.username);
    const email = normalizeEmail(dto.email);
    const phone = dto.phone ? normalizePhone(dto.phone) : null;
    if (dto.phone && !phone) {
      throw new ConflictException("شماره موبایل معتبر نیست.");
    }

    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { usernameNormalized },
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });
    if (existing) {
      throw new ConflictException(
        "امکان ثبت‌نام با این مشخصات وجود ندارد. ورود را امتحان کنید.",
      );
    }

    const passwordHash = await this.passwords.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username.trim(),
        usernameNormalized,
        email,
        phone,
        displayName: dto.displayName.trim(),
        role: UserRole.STUDENT,
        passwordHash,
      },
    });

    const session = await this.sessions.createSession({
      userId: user.id,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    return {
      user: toPublicUser(user),
      sessionToken: session.rawToken,
      expiresAt: session.expiresAt,
    };
  }

  async login(
    dto: LoginDto,
    meta: { userAgent?: string | null; ipAddress?: string | null },
  ): Promise<{ user: PublicUser; sessionToken: string; expiresAt: Date }> {
    const classified = classifyIdentifier(dto.identifier);
    if (!classified) {
      throw new UnauthorizedException("نام کاربری یا رمز عبور نادرست است.");
    }

    const user = await this.findByIdentifier(classified.kind, classified.normalized);
    if (!user) {
      // Dummy verify to reduce timing oracle
      await this.passwords.hash("timing-pad");
      throw new UnauthorizedException("نام کاربری یا رمز عبور نادرست است.");
    }

    const ok = await this.passwords.verify(user.passwordHash, dto.password);
    if (!ok) {
      throw new UnauthorizedException("نام کاربری یا رمز عبور نادرست است.");
    }

    const session = await this.sessions.createSession({
      userId: user.id,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    return {
      user: toPublicUser(user),
      sessionToken: session.rawToken,
      expiresAt: session.expiresAt,
    };
  }

  async logout(rawToken: string | null | undefined): Promise<void> {
    if (!rawToken) return;
    await this.sessions.revokeByRawToken(rawToken);
  }

  async me(rawToken: string | null | undefined): Promise<PublicUser | null> {
    if (!rawToken) return null;
    const session = await this.sessions.findValidSession(rawToken);
    if (!session) return null;
    return toPublicUser(session.user);
  }

  /**
   * Password recovery request — never reveals whether the account exists.
   * Always returns a challengeId (real or decoy) so response shape cannot enumerate.
   */
  async requestRecovery(destination: string): Promise<{
    message: string;
    challengeId: string;
  }> {
    const trimmed = destination.trim();
    let channel: OtpChannel = OtpChannel.EMAIL;
    let normalized = normalizeEmail(trimmed);
    let userId: string | null = null;
    let validDestination = false;

    if (trimmed.includes("@") && isValidEmail(trimmed)) {
      channel = OtpChannel.EMAIL;
      normalized = normalizeEmail(trimmed);
      validDestination = true;
      const user = await this.prisma.user.findUnique({
        where: { email: normalized },
      });
      userId = user?.id ?? null;
    } else {
      const phone = normalizePhone(trimmed);
      if (phone) {
        channel = OtpChannel.SMS;
        normalized = phone;
        validDestination = true;
        const user = await this.prisma.user.findUnique({
          where: { phone },
        });
        userId = user?.id ?? null;
      } else {
        // Decoy destination keeps timing/shape similar for garbage input
        normalized = `decoy:${normalizeUsername(trimmed) || "invalid"}`;
        channel = OtpChannel.EMAIL;
      }
    }

    const { challengeId, code, expiresAt } = await this.otp.createChallenge({
      userId,
      channel,
      purpose: OtpPurpose.PASSWORD_RECOVERY,
      destinationNormalized: normalized,
    });

    // Only deliver OTP when a real user matched a valid destination
    if (validDestination && userId) {
      const body = `کد بازیابی ژرفا: ${code}\nاعتبار تا ${expiresAt.toISOString()}`;
      if (channel === OtpChannel.EMAIL) {
        await this.messaging.sendEmail({
          to: normalized,
          subject: "کد بازیابی رمز عبور ژرفا",
          body,
        });
      } else {
        await this.messaging.sendSms({ to: normalized, body });
      }
    }

    return {
      message: GENERIC_RECOVER_MESSAGE,
      challengeId,
    };
  }

  async confirmRecovery(input: {
    challengeId: string;
    code: string;
    newPassword: string;
  }): Promise<{ ok: true }> {
    const result = await this.otp.consumeChallenge({
      challengeId: input.challengeId,
      code: input.code,
      purpose: OtpPurpose.PASSWORD_RECOVERY,
    });

    if (!result.ok || !result.challenge.userId) {
      throw new UnauthorizedException("کد بازیابی نامعتبر یا منقضی است.");
    }

    const passwordHash = await this.passwords.hash(input.newPassword);
    await this.prisma.user.update({
      where: { id: result.challenge.userId },
      data: { passwordHash },
    });
    await this.sessions.revokeAllForUser(result.challenge.userId);

    return { ok: true };
  }

  private findByIdentifier(
    kind: "email" | "phone" | "username",
    normalized: string,
  ) {
    if (kind === "email") {
      return this.prisma.user.findUnique({ where: { email: normalized } });
    }
    if (kind === "phone") {
      return this.prisma.user.findUnique({ where: { phone: normalized } });
    }
    return this.prisma.user.findUnique({
      where: { usernameNormalized: normalized },
    });
  }
}
