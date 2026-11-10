export type AiJsonCompletionInput = {
  system: string;
  user: string;
  /** Soft cap; providers may map to max_tokens. */
  maxTokens?: number;
};

export type AiJsonCompletionResult = {
  raw: string;
  parsed: unknown;
  model: string;
  usage?: { promptTokens?: number; completionTokens?: number };
};

export interface AiProvider {
  readonly id: string;
  completeJson(input: AiJsonCompletionInput): Promise<AiJsonCompletionResult>;
}

export class AiNotConfiguredError extends Error {
  readonly code = "AI_NOT_CONFIGURED" as const;
  constructor(message = "ارائه‌دهندهٔ هوش مصنوعی پیکربندی نشده است.") {
    super(message);
    this.name = "AiNotConfiguredError";
  }
}
