import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  GatewayCredentialsStatus,
  IntegrationProvider,
  type Prisma,
} from "@zharfa/database";
import { PrismaService } from "../prisma/prisma.service";
import {
  decryptSecret,
  encryptSecret,
  last4,
  maskSecret,
} from "../spotplayer/credential-crypto";

export type IntegrationPublicView = {
  provider: IntegrationProvider;
  credentialsStatus: GatewayCredentialsStatus;
  secretMasked: string | null;
  config: Record<string, unknown> | null;
  connectedAt: string | null;
  lastTestedAt: string | null;
  lastError: string | null;
  oauthConnected: boolean;
};

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<IntegrationPublicView[]> {
    const providers: IntegrationProvider[] = [
      IntegrationProvider.OPENAI,
      IntegrationProvider.GOOGLE_OAUTH,
      IntegrationProvider.ANTHROPIC,
    ];
    const rows = await this.prisma.integrationCredential.findMany();
    const byProvider = new Map(rows.map((r) => [r.provider, r]));
    return providers.map((provider) => {
      const row = byProvider.get(provider);
      return this.toView(provider, row ?? null);
    });
  }

  async get(provider: IntegrationProvider) {
    const row = await this.prisma.integrationCredential.findUnique({
      where: { provider },
    });
    return this.toView(provider, row);
  }

  /** Resolves plaintext OpenAI key: DB override, then env OPENAI_API_KEY. */
  async resolveOpenAiKey(): Promise<string | null> {
    const row = await this.prisma.integrationCredential.findUnique({
      where: { provider: IntegrationProvider.OPENAI },
    });
    if (row?.secretEncrypted) {
      const plain = decryptSecret(row.secretEncrypted);
      if (plain?.trim()) return plain.trim();
    }
    const env = process.env.OPENAI_API_KEY?.trim();
    return env || null;
  }

  async resolveGoogleOAuthClient(): Promise<{
    clientId: string;
    clientSecret: string;
  } | null> {
    const row = await this.prisma.integrationCredential.findUnique({
      where: { provider: IntegrationProvider.GOOGLE_OAUTH },
    });
    if (!row?.secretEncrypted) return null;
    const clientSecret = decryptSecret(row.secretEncrypted);
    const config = (row.configJson ?? {}) as { clientId?: string };
    const clientId = config.clientId?.trim();
    if (!clientId || !clientSecret?.trim()) return null;
    return { clientId, clientSecret: clientSecret.trim() };
  }

  async upsertSecret(
    provider: IntegrationProvider,
    input: {
      secret?: string | null;
      clearSecret?: boolean;
      config?: Record<string, unknown> | null;
      clearOAuthTokens?: boolean;
    },
  ) {
    if (provider === IntegrationProvider.ANTHROPIC) {
      throw new BadRequestException(
        "آداپتر Anthropic هنوز فعال نیست؛ فقط رابط آماده است.",
      );
    }

    const existing = await this.prisma.integrationCredential.findUnique({
      where: { provider },
    });

    const data: Prisma.IntegrationCredentialUncheckedUpdateInput = {
      lastError: null,
    };

    if (input.clearSecret) {
      data.secretEncrypted = null;
      data.secretLast4 = null;
    } else if (input.secret != null && input.secret.trim()) {
      const plain = input.secret.trim();
      data.secretEncrypted = encryptSecret(plain);
      data.secretLast4 = last4(plain);
    }

    if (input.config !== undefined) {
      data.configJson = input.config as Prisma.InputJsonValue;
    }

    if (input.clearOAuthTokens) {
      data.oauthAccessEncrypted = null;
      data.oauthRefreshEncrypted = null;
      data.oauthAccessExpiresAt = null;
      data.connectedAt = null;
    }

    const nextSecret =
      typeof data.secretEncrypted === "string"
        ? data.secretEncrypted
        : input.clearSecret
          ? null
          : existing?.secretEncrypted ?? null;

    const envFallback =
      provider === IntegrationProvider.OPENAI &&
      Boolean(process.env.OPENAI_API_KEY?.trim());

    data.credentialsStatus =
      nextSecret || envFallback
        ? GatewayCredentialsStatus.PRESENT
        : GatewayCredentialsStatus.MISSING;

    const row = existing
      ? await this.prisma.integrationCredential.update({
          where: { provider },
          data,
        })
      : await this.prisma.integrationCredential.create({
          data: {
            provider,
            secretEncrypted:
              typeof data.secretEncrypted === "string"
                ? data.secretEncrypted
                : null,
            secretLast4:
              typeof data.secretLast4 === "string" ? data.secretLast4 : null,
            configJson: (data.configJson as Prisma.InputJsonValue) ?? undefined,
            credentialsStatus: data.credentialsStatus as GatewayCredentialsStatus,
          },
        });

    return this.toView(provider, row);
  }

  async markTested(
    provider: IntegrationProvider,
    ok: boolean,
    error?: string,
  ) {
    const row = await this.prisma.integrationCredential.findUnique({
      where: { provider },
    });
    if (!row) throw new NotFoundException("یکپارچه‌سازی یافت نشد.");
    const updated = await this.prisma.integrationCredential.update({
      where: { provider },
      data: {
        lastTestedAt: new Date(),
        lastError: ok ? null : error?.slice(0, 500) ?? "test_failed",
      },
    });
    return this.toView(provider, updated);
  }

  private toView(
    provider: IntegrationProvider,
    row: {
      credentialsStatus: GatewayCredentialsStatus;
      secretEncrypted: string | null;
      secretLast4: string | null;
      configJson: Prisma.JsonValue | null;
      connectedAt: Date | null;
      lastTestedAt: Date | null;
      lastError: string | null;
      oauthRefreshEncrypted: string | null;
    } | null,
  ): IntegrationPublicView {
    const envPresent =
      provider === IntegrationProvider.OPENAI &&
      Boolean(process.env.OPENAI_API_KEY?.trim());
    const status =
      row?.credentialsStatus === GatewayCredentialsStatus.PRESENT || envPresent
        ? GatewayCredentialsStatus.PRESENT
        : GatewayCredentialsStatus.MISSING;

    let secretMasked: string | null = null;
    if (row?.secretLast4) secretMasked = `••••••••${row.secretLast4}`;
    else if (envPresent) secretMasked = maskSecret(process.env.OPENAI_API_KEY);

    return {
      provider,
      credentialsStatus: status,
      secretMasked,
      config: (row?.configJson as Record<string, unknown> | null) ?? null,
      connectedAt: row?.connectedAt?.toISOString() ?? null,
      lastTestedAt: row?.lastTestedAt?.toISOString() ?? null,
      lastError: row?.lastError ?? null,
      oauthConnected: Boolean(row?.oauthRefreshEncrypted),
    };
  }
}
