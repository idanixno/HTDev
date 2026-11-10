import { Module, forwardRef } from "@nestjs/common";
import { CommerceModule } from "../commerce/commerce.module";
import { OwnerGuard } from "../commerce/roles.guard";
import { IdentityModule } from "../identity/identity.module";
import { SpotPlayerModule } from "../spotplayer/spotplayer.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AnalyticsService } from "./analytics.service";
import { AuditService } from "./audit.service";

@Module({
  imports: [
    IdentityModule,
    CommerceModule,
    forwardRef(() => SpotPlayerModule),
  ],
  controllers: [AdminController],
  providers: [AdminService, AnalyticsService, AuditService, OwnerGuard],
  exports: [AdminService, AnalyticsService, AuditService],
})
export class AdminModule {}
