import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  GradeRequest,
  GradeVerdict,
  LlmGradingProvider,
} from "./provider.interface";
import { GRADER_SYSTEM_PROMPT, userMessageFor } from "./prompt";
import { parseVerdict, withTimeout } from "./util";

// Uses OpenAI's Chat Completions endpoint with response_format: json_object.
// We deliberately use raw fetch instead of the openai SDK — one endpoint, fewer deps.
@Injectable()
export class OpenAiGraderProvider implements LlmGradingProvider {
  readonly name = "openai" as const;

  constructor(private readonly config: ConfigService) {}

  async grade(
    req: GradeRequest,
    opts: { timeoutMs: number }
  ): Promise<GradeVerdict> {
    const apiKey = this.config.getOrThrow<string>("OPENAI_API_KEY");
    const model = this.config.get<string>("OPENAI_MODEL") ?? "gpt-4o-mini";

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs);

    try {
      const res = await withTimeout(
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0, // deterministic-ish grading
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: GRADER_SYSTEM_PROMPT },
              { role: "user", content: userMessageFor(req) },
            ],
          }),
          signal: controller.signal,
        }),
        opts.timeoutMs,
        "openai"
      );

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`openai ${res.status}: ${body.slice(0, 200)}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("openai: empty content");

      const parsed = parseVerdict(content);
      return {
        ...parsed,
        provider: "openai",
        model,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
