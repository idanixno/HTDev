import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { OwnerGuard } from "../commerce/roles.guard";
import { SecurityEventsService } from "./security-events.service";

@Controller("admin/security")
@UseGuards(OwnerGuard)
export class SecurityController {
  constructor(private readonly security: SecurityEventsService) {}

  @Get("events")
  events(@Query("limit") limit?: string) {
    return this.security.recent(Number(limit) || 50);
  }

  @Get("summary")
  summary() {
    return this.security.summary(7);
  }
}
