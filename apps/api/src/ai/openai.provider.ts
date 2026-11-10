import {
  AiNotConfiguredError,
  type AiJsonCompletionInput,
  type AiJsonCompletionResult,
  type AiProvider,
} from "./ai-provider";

export class OpenAiProvider implements AiProvider {
  readonly id = "openai";

  constructor(
    private readonly getApiKey: () => Promise<string | null>,
    private readonly model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
  ) {}

  async completeJson(
    input: AiJsonCompletionInput,
  ): Promise<AiJsonCompletionResult> {
    const key = await this.getApiKey();
    if (!key) throw new AiNotConfiguredError();

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.3,
        max_tokens: input.maxTokens ?? 900,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `OpenAI error ${res.status}: ${text.slice(0, 240) || res.statusText}`,
      );
    }

    const data = (await res.json()) as {
      model?: string;
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "{}";
    let parsed: unknown = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { raw };
    }
    return {
      raw,
      parsed,
      model: data.model ?? this.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
      },
    };
  }
}
