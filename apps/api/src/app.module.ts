import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { IdentityModule } from "./identity/identity.module";
import { CatalogModule } from "./catalog/catalog.module";
import { CommerceModule } from "./commerce/commerce.module";
import { SpotPlayerModule } from "./spotplayer/spotplayer.module";

@Module({
  imports: [
    PrismaModule,
    IdentityModule,
    CatalogModule,
    CommerceModule,
    SpotPlayerModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
