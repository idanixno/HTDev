import { Module, forwardRef } from "@nestjs/common";
import { IdentityModule } from "../identity/identity.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { OwnerGuard } from "../commerce/roles.guard";
import { TicketAttachmentStorage } from "./attachment-storage";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";

@Module({
  imports: [IdentityModule, forwardRef(() => NotificationsModule)],
  controllers: [TicketsController],
  providers: [TicketsService, TicketAttachmentStorage, OwnerGuard],
  exports: [TicketsService],
})
export class TicketsModule {}
