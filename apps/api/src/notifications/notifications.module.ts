import { Module, forwardRef } from "@nestjs/common";
import { IdentityModule } from "../identity/identity.module";
import {
  ConsoleEmailAdapter,
  ConsoleSmsAdapter,
  EMAIL_CHANNEL,
  SMS_CHANNEL,
} from "./channels/console-channel.adapters";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [forwardRef(() => IdentityModule)],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    ConsoleEmailAdapter,
    ConsoleSmsAdapter,
    { provide: EMAIL_CHANNEL, useExisting: ConsoleEmailAdapter },
    { provide: SMS_CHANNEL, useExisting: ConsoleSmsAdapter },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
