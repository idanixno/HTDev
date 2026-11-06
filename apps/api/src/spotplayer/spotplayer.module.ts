import { Module } from "@nestjs/common";
import { IdentityModule } from "../identity/identity.module";
import { OwnerGuard } from "../commerce/roles.guard";
import { SpotPlayerController } from "./spotplayer.controller";
import { SpotPlayerService } from "./spotplayer.service";

@Module({
  imports: [IdentityModule],
  controllers: [SpotPlayerController],
  providers: [SpotPlayerService, OwnerGuard],
  exports: [SpotPlayerService],
})
export class SpotPlayerModule {}
