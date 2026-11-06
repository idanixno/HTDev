import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { IdentityModule } from "./identity/identity.module";
import { CatalogModule } from "./catalog/catalog.module";

@Module({
  imports: [PrismaModule, IdentityModule, CatalogModule],
  controllers: [HealthController],
})
export class AppModule {}
