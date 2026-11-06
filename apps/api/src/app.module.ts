import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { IdentityModule } from "./identity/identity.module";

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [HealthController],
})
export class AppModule {}
