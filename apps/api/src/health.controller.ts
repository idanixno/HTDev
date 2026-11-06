import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      service: "api",
      status: "ok",
      timestamp: new Date().toISOString(),
      note: "Payment and SpotPlayer adapters are not stubbed as success.",
    };
  }
}
