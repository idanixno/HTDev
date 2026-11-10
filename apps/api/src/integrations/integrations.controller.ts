import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IntegrationProvider } from "@zharfa/database";
import { AiNotConfiguredError } from "../ai/ai-provider";
import { AiRouterService } from "../ai/ai-router.service";
import { OwnerGuard } from "../commerce/roles.guard";
import {
  TestIntegrationDto,
  UpsertIntegrationDto,
} from "./integrations.dto";
import { IntegrationsService } from "./integrations.service";

@Controller("admin/integrations")
@UseGuards(OwnerGuard)
export class IntegrationsController {
  constructor(
    private readonly integrations: IntegrationsService,
    private readonly ai: AiRouterService,
  ) {}

  @Get()
  list() {
    return this.integrations.list();
  }

  @Post()
  upsert(@Body() body: UpsertIntegrationDto) {
    return this.integrations.upsertSecret(body.provider, body);
  }

  @Post("test")
  async test(@Body() body: TestIntegrationDto) {
    if (body.provider === IntegrationProvider.OPENAI) {
      try {
        await this.ai.completeJson({
          system: "Return JSON {\"ok\":true}.",
          user: "{}",
          maxTokens: 20,
        });
        return this.integrations.markTested(body.provider, true);
      } catch (error) {
        const message =
          error instanceof AiNotConfiguredError
            ? error.message
            : error instanceof Error
              ? error.message
              : "test_failed";
        try {
          await this.integrations.markTested(body.provider, false, message);
        } catch {
          /* row may not exist yet */
        }
        return {
          provider: body.provider,
          ok: false,
          error: message,
          credentialsStatus: "MISSING",
        };
      }
    }

    if (body.provider === IntegrationProvider.GOOGLE_OAUTH) {
      const client = await this.integrations.resolveGoogleOAuthClient();
      if (!client) {
        return {
          provider: body.provider,
          ok: false,
          code: "NOT_CONFIGURED",
          message: "Client ID/Secret گوگل تنظیم نشده است.",
        };
      }
      return {
        provider: body.provider,
        ok: true,
        code: "CREDENTIALS_PRESENT",
        message:
          "اعتبارنامه ذخیره شد. اتصال Search Console/GA4 هنوز انجام نشده.",
      };
    }

    return {
      provider: body.provider,
      ok: false,
      code: "UNSUPPORTED",
      message: "این ارائه‌دهنده در نسخهٔ فعلی پشتیبانی نمی‌شود.",
    };
  }
}
