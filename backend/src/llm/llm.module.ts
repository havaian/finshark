import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmGradeCacheRepository } from './llm-grade-cache.repository';
import { LlmGraderService, LLM_PROVIDER_TOKEN } from './llm-grader.service';
import { OpenAiGraderProvider } from './providers/openai.provider';
import { AnthropicGraderProvider } from './providers/anthropic.provider';
import type { LlmGradingProvider } from './providers/provider.interface';

// We register BOTH provider classes so the factory can pick one at runtime.
// Only the one named in LLM_PROVIDER is actually returned via the LLM_PROVIDER_TOKEN.
// If LLM_PROVIDER=none, the token resolves to null, and LlmGraderService
// falls back to exact-match.
@Global()
@Module({
  providers: [
    LlmGradeCacheRepository,
    OpenAiGraderProvider,
    AnthropicGraderProvider,
    {
      provide: LLM_PROVIDER_TOKEN,
      inject: [ConfigService, OpenAiGraderProvider, AnthropicGraderProvider],
      useFactory: (
        config: ConfigService,
        openai: OpenAiGraderProvider,
        anthropic: AnthropicGraderProvider,
      ): LlmGradingProvider | null => {
        const provider = (config.get<string>('LLM_PROVIDER') ?? 'none').toLowerCase();
        if (provider === 'openai') return openai;
        if (provider === 'anthropic') return anthropic;
        return null;
      },
    },
    LlmGraderService,
  ],
  exports: [LlmGraderService],
})
export class LlmModule {}
