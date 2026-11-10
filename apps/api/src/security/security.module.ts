import { Module } from "@nestjs/common";
import { OwnerGuard } from "../commerce/roles.guard";
import { IdentityModule } from "../identity/identity.module";
import { SecurityController } from "./security.controller";
import { SecurityEventsService } from "./security-events.service";
import { SecurityIngestController } from "./security-ingest.controller";

@Module({
  imports: [IdentityModule],
  controllers: [SecurityController, SecurityIngestController],
  providers: [SecurityEventsService, OwnerGuard],
  exports: [SecurityEventsService],
})
export class SecurityModule {}
