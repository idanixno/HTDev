import { Injectable } from "@nestjs/common";
import { IntegrationsService } from "../integrations/integrations.service";
import {
  AiNotConfiguredError,
  type AiJsonCompletionInput,
  type AiJsonCompletionResult,
  type AiProvider,
} from "./ai-provider";
import { OpenAiProvider } from "./openai.provider";

@Injectable()
export class AiRouterService {
  private readonly openai: OpenAiProvider;

  constructor(private readonly integrations: IntegrationsService) {
    this.openai = new OpenAiProvider(() => this.integrations.resolveOpenAiKey());
  }

  /** Active provider — OpenAI for v1; Anthropic slot reserved. */
  activeProvider(): AiProvider {
    return this.openai;
  }

  async completeJson(
    input: AiJsonCompletionInput,
  ): Promise<AiJsonCompletionResult> {
    const key = await this.integrations.resolveOpenAiKey();
    if (!key) throw new AiNotConfiguredError();
    return this.activeProvider().completeJson(input);
  }

  async isConfigured(): Promise<boolean> {
    return Boolean(await this.integrations.resolveOpenAiKey());
  }
}
