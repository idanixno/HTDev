import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { SpotPlayerLicenseStatus } from "@zharfa/database";
import { AuthGuard, type AuthedRequest } from "../identity/auth.guard";
import { OwnerGuard } from "../commerce/roles.guard";
import {
  GrantFreeAccessDto,
  UpdateSpotPlayerSettingsDto,
  UpsertCourseMappingDto,
} from "./dto/spotplayer.dto";
import { SpotPlayerService } from "./spotplayer.service";

@Controller("spotplayer")
export class SpotPlayerController {
  constructor(private readonly spotplayer: SpotPlayerService) {}

  /** Student: list my access / licenses + platform instructions. */
  @Get("access")
  @UseGuards(AuthGuard)
  async myAccess(@Req() req: AuthedRequest) {
    return this.spotplayer.listMyAccess(req.user!.id);
  }

  /** Free course grant — no payment gateway. */
  @Post("access/free")
  @UseGuards(AuthGuard)
  async grantFree(
    @Req() req: AuthedRequest,
    @Body() body: GrantFreeAccessDto,
  ) {
    return this.spotplayer.grantFreeAccess(req.user!.id, body.courseSlug);
  }

  /** Public-ish platform facts (authenticated) for UI copy. */
  @Get("platforms")
  async platforms() {
    const config = await this.spotplayer.getPublicConfig();
    return {
      platformSupport: config.platformSupport,
      integrationStatus: config.integrationStatus,
    };
  }

  // ── Admin ────────────────────────────────────────────────────────────

  @Get("admin/config")
  @UseGuards(OwnerGuard)
  async adminConfig() {
    return this.spotplayer.getPublicConfig();
  }

  @Patch("admin/config")
  @UseGuards(OwnerGuard)
  async updateConfig(@Body() body: UpdateSpotPlayerSettingsDto) {
    return this.spotplayer.updateSettings(body);
  }

  @Get("admin/mappings")
  @UseGuards(OwnerGuard)
  async listMappings() {
    return this.spotplayer.listMappings();
  }

  @Post("admin/mappings")
  @UseGuards(OwnerGuard)
  async upsertMapping(@Body() body: UpsertCourseMappingDto) {
    return this.spotplayer.upsertMapping(body);
  }

  @Get("admin/licenses")
  @UseGuards(OwnerGuard)
  async adminLicenses(@Query("status") status?: string) {
    const parsed =
      status &&
      Object.values(SpotPlayerLicenseStatus).includes(
        status as SpotPlayerLicenseStatus,
      )
        ? (status as SpotPlayerLicenseStatus)
        : undefined;
    return this.spotplayer.adminListLicenses(
      parsed ? { status: parsed } : undefined,
    );
  }

  @Post("admin/licenses/:id/retry")
  @UseGuards(OwnerGuard)
  async retry(@Param("id") id: string) {
    return this.spotplayer.retryLicense(id);
  }

  @Get("admin/diagnostics")
  @UseGuards(OwnerGuard)
  async diagnostics() {
    return this.spotplayer.adminDiagnostics();
  }
}
