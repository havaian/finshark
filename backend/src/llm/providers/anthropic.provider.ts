import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  GradeRequest,
  GradeVerdict,
  LlmGradingProvider,
} from './provider.interface';
import { GRADER_SYSTEM_PROMPT, userMessageFor } from './prompt';
import { parseVerdict, withTimeout } from './util';

// Uses Anthropic /v1/messages. Same shape considerations as OpenAI provider —
// raw fetch keeps the dep list small.
@Injectable()
export class AnthropicGraderProvider implements LlmGradingProvider {
  readonly name = 'anthropic' as const;

  constructor(private readonly config: ConfigService) {}

  async grade(req: GradeRequest, opts: { timeoutMs: number }): Promise<GradeVerdict> {
    const apiKey = this.config.getOrThrow<string>('ANTHROPIC_API_KEY');
    const model = this.config.get<string>('ANTHROPIC_MODEL') ?? 'claude-haiku-4-5-20251001';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), opts.timeoutMs);

    try {
      const res = await withTimeout(
        fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: 400,
            temperature: 0,
            system: GRADER_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userMessageFor(req) }],
          }),
          signal: controller.signal,
        }),
        opts.timeoutMs,
        'anthropic',
      );

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`anthropic ${res.status}: ${body.slice(0, 200)}`);
      }

      const data = (await res.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };

      // Find first text block.
      const text = data.content?.find((b) => b.type === 'text')?.text;
      if (!text) throw new Error('anthropic: no text content');

      const parsed = parseVerdict(text);
      return {
        ...parsed,
        provider: 'anthropic',
        model,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
