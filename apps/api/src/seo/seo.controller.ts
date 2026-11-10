import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { OwnerGuard } from "../commerce/roles.guard";
import type { AuthedRequest } from "../identity/auth.guard";
import { SeoAnalyzeDto, SeoDecisionDto, SeoSuggestDto } from "./seo.dto";
import { SeoService } from "./seo.service";

@Controller("admin/seo")
@UseGuards(OwnerGuard)
export class SeoController {
  constructor(private readonly seo: SeoService) {}

  @Get("overview")
  overview() {
    return this.seo.overview();
  }

  @Get("content-audit")
  contentAudit() {
    return this.seo.contentAudit();
  }

  @Get("ai-status")
  aiStatus() {
    return this.seo.aiStatus();
  }

  @Post("analyze")
  analyze(@Body() body: SeoAnalyzeDto) {
    return this.seo.analyze(body);
  }

  @Post("suggest")
  suggest(@Req() req: AuthedRequest, @Body() body: SeoSuggestDto) {
    return this.seo.suggest(req.user!.id, body);
  }

  @Post("decision")
  decision(@Req() req: AuthedRequest, @Body() body: SeoDecisionDto) {
    return this.seo.logDecision(req.user!.id, body);
  }
}
