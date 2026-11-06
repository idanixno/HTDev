import { Inject, Injectable } from "@nestjs/common";
import {
  GatewayCredentialsStatus,
  PaymentProvider,
  Prisma,
} from "@zharfa/database";
import { PrismaService } from "../../prisma/prisma.service";
import { AqayePardakhtAdapter } from "./aqayepardakht.adapter";
import { MockPaymentAdapter } from "./mock.adapter";
import { ZarinPalAdapter } from "./zarinpal.adapter";
import {
  PAYMENT_GATEWAYS,
  type GatewayIntegrationStatus,
  type PaymentGatewayAdapter,
} from "./payment-gateway.types";

export type UsableGatewayView = {
  provider: PaymentProvider;
  integrationStatus: GatewayIntegrationStatus;
  technicalEnabled: boolean;
  checkoutVisible: boolean;
  isDefault: boolean;
  sandboxMode: boolean;
  credentialsStatus: GatewayCredentialsStatus;
  usableAtCheckout: boolean;
};

@Injectable()
export class GatewayRegistryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly zarinpal: ZarinPalAdapter,
    private readonly aqaye: AqayePardakhtAdapter,
    @Inject(PAYMENT_GATEWAYS)
    private readonly adapters: PaymentGatewayAdapter[],
  ) {}

  getAdapter(provider: PaymentProvider): PaymentGatewayAdapter {
    if (process.env.PAYMENT_MOCK_HOOKS === "true") {
      return new MockPaymentAdapter(provider);
    }
    const found = this.adapters.find((a) => a.provider === provider);
    if (!found) {
      throw new Error(`No adapter registered for ${provider}`);
    }
    return found;
  }

  async ensureDefaults(): Promise<void> {
    const providers = [
      PaymentProvider.ZARINPAL,
      PaymentProvider.AQAYE_PARDAKHT,
    ] as const;
    for (const provider of providers) {
      const adapter =
        provider === PaymentProvider.ZARINPAL ? this.zarinpal : this.aqaye;
      const credentialsStatus = adapter.hasCredentials()
        ? GatewayCredentialsStatus.PRESENT
        : GatewayCredentialsStatus.MISSING;
      await this.prisma.paymentGatewaySetting.upsert({
        where: { provider },
        create: {
          provider,
          technicalEnabled: true,
          checkoutVisible: true,
          isDefault: provider === PaymentProvider.ZARINPAL,
          sandboxMode: true,
          credentialsStatus,
        },
        update: { credentialsStatus },
      });
    }
  }

  async listGatewayViews(): Promise<UsableGatewayView[]> {
    await this.ensureDefaults();
    const rows = await this.prisma.paymentGatewaySetting.findMany({
      orderBy: { provider: "asc" },
    });
    return rows.map((row) => {
      const adapter = this.getAdapter(row.provider);
      const integrationStatus = adapter.integrationStatus();
      // Respect DB technicalEnabled even if env adapter thinks enabled.
      const effectiveStatus: GatewayIntegrationStatus = !row.technicalEnabled
        ? "DISABLED"
        : integrationStatus;
      const usableAtCheckout =
        row.checkoutVisible &&
        row.technicalEnabled &&
        effectiveStatus === "IMPLEMENTED";
      return {
        provider: row.provider,
        integrationStatus: effectiveStatus,
        technicalEnabled: row.technicalEnabled,
        checkoutVisible: row.checkoutVisible,
        isDefault: row.isDefault,
        sandboxMode: row.sandboxMode,
        credentialsStatus: adapter.hasCredentials()
          ? GatewayCredentialsStatus.PRESENT
          : GatewayCredentialsStatus.MISSING,
        usableAtCheckout,
      };
    });
  }

  async anyUsableAtCheckout(): Promise<boolean> {
    const views = await this.listGatewayViews();
    return views.some((v) => v.usableAtCheckout);
  }

  async resolveCheckoutProvider(
    preferred?: PaymentProvider | null,
  ): Promise<UsableGatewayView | null> {
    const views = await this.listGatewayViews();
    const usable = views.filter((v) => v.usableAtCheckout);
    if (usable.length === 0) return null;
    if (preferred) {
      const match = usable.find((v) => v.provider === preferred);
      if (match) return match;
    }
    return usable.find((v) => v.isDefault) ?? usable[0] ?? null;
  }

  async updateSetting(
    provider: PaymentProvider,
    patch: {
      technicalEnabled?: boolean;
      checkoutVisible?: boolean;
      isDefault?: boolean;
      sandboxMode?: boolean;
    },
  ): Promise<UsableGatewayView[]> {
    await this.ensureDefaults();

    if (patch.isDefault === true) {
      await this.prisma.paymentGatewaySetting.updateMany({
        data: { isDefault: false },
      });
    }

    const adapter = this.getAdapter(provider);
    const data: Prisma.PaymentGatewaySettingUpdateInput = {
      ...patch,
      credentialsStatus: adapter.hasCredentials()
        ? GatewayCredentialsStatus.PRESENT
        : GatewayCredentialsStatus.MISSING,
    };
    await this.prisma.paymentGatewaySetting.update({
      where: { provider },
      data,
    });
    return this.listGatewayViews();
  }
}
