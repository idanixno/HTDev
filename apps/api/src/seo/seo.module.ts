import { Module } from "@nestjs/common";
import { OwnerGuard } from "../commerce/roles.guard";
import { IdentityModule } from "../identity/identity.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { SeoController } from "./seo.controller";
import { SeoService } from "./seo.service";

@Module({
  imports: [IdentityModule, IntegrationsModule],
  controllers: [SeoController],
  providers: [SeoService, OwnerGuard],
  exports: [SeoService],
})
export class SeoModule {}
