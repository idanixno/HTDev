import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { IdentityModule } from "./identity/identity.module";
import { CatalogModule } from "./catalog/catalog.module";
import { CommerceModule } from "./commerce/commerce.module";
import { SpotPlayerModule } from "./spotplayer/spotplayer.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { TicketsModule } from "./tickets/tickets.module";
import { AdminModule } from "./admin/admin.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { SeoModule } from "./seo/seo.module";
import { SecurityModule } from "./security/security.module";

@Module({
  imports: [
    PrismaModule,
    IdentityModule,
    CatalogModule,
    CommerceModule,
    SpotPlayerModule,
    NotificationsModule,
    TicketsModule,
    AdminModule,
    IntegrationsModule,
    SeoModule,
    SecurityModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
