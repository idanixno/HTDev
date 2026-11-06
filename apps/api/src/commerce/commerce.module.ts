import { Module } from "@nestjs/common";
import { IdentityModule } from "../identity/identity.module";
import { CommerceController } from "./commerce.controller";
import { CommerceService } from "./commerce.service";
import { AqayePardakhtAdapter } from "./gateways/aqayepardakht.adapter";
import { GatewayRegistryService } from "./gateways/gateway-registry.service";
import { PAYMENT_GATEWAYS } from "./gateways/payment-gateway.types";
import { ZarinPalAdapter } from "./gateways/zarinpal.adapter";
import { OwnerGuard } from "./roles.guard";

@Module({
  imports: [IdentityModule],
  controllers: [CommerceController],
  providers: [
    CommerceService,
    GatewayRegistryService,
    ZarinPalAdapter,
    AqayePardakhtAdapter,
    OwnerGuard,
    {
      provide: PAYMENT_GATEWAYS,
      useFactory: (z: ZarinPalAdapter, a: AqayePardakhtAdapter) => [z, a],
      inject: [ZarinPalAdapter, AqayePardakhtAdapter],
    },
  ],
  exports: [CommerceService, GatewayRegistryService],
})
export class CommerceModule {}
