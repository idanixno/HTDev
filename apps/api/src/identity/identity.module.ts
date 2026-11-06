import { Module } from "@nestjs/common";
import { IdentityController } from "./identity.controller";
import { IdentityService } from "./identity.service";
import { PasswordService } from "./password.service";
import { SessionService } from "./session.service";
import { OtpService } from "./otp.service";
import { AuthGuard } from "./auth.guard";
import { RateLimitStubGuard } from "./rate-limit.stub";
import { ConsoleMessagingProvider } from "./messaging/console-messaging.provider";
import { MESSAGING_PROVIDER } from "./messaging/messaging.types";

@Module({
  controllers: [IdentityController],
  providers: [
    IdentityService,
    PasswordService,
    SessionService,
    OtpService,
    AuthGuard,
    RateLimitStubGuard,
    ConsoleMessagingProvider,
    {
      provide: MESSAGING_PROVIDER,
      useExisting: ConsoleMessagingProvider,
    },
  ],
  exports: [IdentityService, SessionService, AuthGuard],
})
export class IdentityModule {}
