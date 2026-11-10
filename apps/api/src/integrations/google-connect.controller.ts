import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { OwnerGuard } from "../commerce/roles.guard";
import { GoogleConnectService } from "./google-connect.service";

@Controller("admin/seo/google")
@UseGuards(OwnerGuard)
export class GoogleConnectController {
  constructor(private readonly google: GoogleConnectService) {}

  @Get("status")
  status() {
    return this.google.status();
  }

  @Get("authorize-url")
  authorizeUrl(@Query("redirectUri") redirectUri?: string) {
    const redirect =
      redirectUri?.trim() ||
      `${process.env.PUBLIC_WEB_ORIGIN ?? "http://localhost:3000"}/admin/seo/google/callback`;
    return this.google.buildAuthorizeUrl(redirect);
  }
}
