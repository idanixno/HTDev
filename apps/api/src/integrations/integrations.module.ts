import { Module } from "@nestjs/common";
import { AiRouterService } from "../ai/ai-router.service";
import { OwnerGuard } from "../commerce/roles.guard";
import { IdentityModule } from "../identity/identity.module";
import { GoogleConnectController } from "./google-connect.controller";
import { GoogleConnectService } from "./google-connect.service";
import { IntegrationsController } from "./integrations.controller";
import { IntegrationsService } from "./integrations.service";

@Module({
  imports: [IdentityModule],
  controllers: [IntegrationsController, GoogleConnectController],
  providers: [
    IntegrationsService,
    GoogleConnectService,
    AiRouterService,
    OwnerGuard,
  ],
  exports: [IntegrationsService, GoogleConnectService, AiRouterService],
})
export class IntegrationsModule {}
