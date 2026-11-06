import { Module, forwardRef } from "@nestjs/common";
import { IdentityModule } from "../identity/identity.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { SpotPlayerModule } from "../spotplayer/spotplayer.module";
import { CommerceController } from "./commerce.controller";
import { CommerceService } from "./commerce.service";
import { AqayePardakhtAdapter } from "./gateways/aqayepardakht.adapter";
import { GatewayRegistryService } from "./gateways/gateway-registry.service";
import { PAYMENT_GATEWAYS } from "./gateways/payment-gateway.types";
import { ZarinPalAdapter } from "./gateways/zarinpal.adapter";
import { OwnerGuard } from "./roles.guard";

@Module({
  imports: [
    IdentityModule,
    forwardRef(() => SpotPlayerModule),
    forwardRef(() => NotificationsModule),
  ],
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
