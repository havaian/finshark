import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LearningObjectivesRepository } from './learning-objectives.repository';
import { PapersRepository } from './papers.repository';
import { QuestionsRepository } from './questions.repository';
import { getTopicHints } from './question-generation-hints';
import type { McqOption, QuestionRow } from './content.types';

// Cost-control caps. Documented in the modal description in the admin UI.
//
// MAX_PER_CALL: hard ceiling for the count parameter. DTO already enforces 3..10,
// this is a defence-in-depth constant the service re-checks.
//
// RATE_LIMIT_PER_HOUR: per-admin generation calls in a rolling 60-minute window.
// In-memory bucket — fine for a single-instance deployment, which is what we run.
// If we ever scale horizontally, move this to Redis or DB.
const MAX_PER_CALL = 10;
const RATE_LIMIT_PER_HOUR = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// Default model + timeout. Both overridable via env. The generation timeout is
// noticeably higher than the grader's because we're asking for a LOT more output
// (10 bilingual questions = ~3-5k output tokens, which takes 20-60s).
const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
const DEFAULT_TIMEOUT_MS = 90_000;

// Shape we expect back from the LLM (mirrors SeedQuestion but parsed at runtime).
// Validation lives in validateLlmQuestion below — we don't trust the model to
// produce exact JSON without checking.
interface LlmGeneratedQuestion {
  type: 'mcq' | 'short_answer' | 'number_entry';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt_en: string;
  prompt_ru: string;
  options?: Array<{
    key: string;
    text_en: string;
    text_ru: string;
    // Per-option "why this is wrong" — required by the prompt for wrong
    // options on MCQ. Null/absent on the correct option. We allow either
    // absent or null at parse time and normalise downstream.
    why_wrong_en?: string | null;
    why_wrong_ru?: string | null;
  }>;
  correct_answer_en: string;
  correct_answer_ru?: string | null;
  explanation_en: string;
  explanation_ru: string;
  concept_bite_en?: string;
  concept_bite_ru?: string;
  // number_entry only: absolute tolerance for matching. Omitted = exact match.
  acceptable_tolerance?: number | null;
}

interface RateBucketEntry {
  timestamps: number[]; // millis when each request was made
}

@Injectable()
export class QuestionGenerationService {
  private readonly log = new Logger(QuestionGenerationService.name);
  // Per-admin rolling-window rate limiter. Map<user_id, timestamps[]>.
  private readonly buckets = new Map<string, RateBucketEntry>();

  constructor(
    private readonly config: ConfigService,
    private readonly papers: PapersRepository,
    private readonly los: LearningObjectivesRepository,
    private readonly questions: QuestionsRepository,
  ) {}

  // Generate `count` draft questions for the given LO, validate them, and insert
  // them as is_active=false. Returns the inserted rows so the frontend can refresh
  // its list. Throws on rate-limit, validation, or upstream API errors.
  async generate(args: {
    admin_user_id: string;
    lo_id: string;
    count: number;
    hints: string;
  }): Promise<QuestionRow[]> {
    if (args.count < 3 || args.count > MAX_PER_CALL) {
      throw new BadRequestException(`count must be between 3 and ${MAX_PER_CALL}`);
    }

    // Rate-limit check (per-admin rolling 1-hour window).
    this.assertWithinRateLimit(args.admin_user_id);

    // Resolve LO + paper context. Need both languages of titles/descriptions so
    // the prompt can ground the LLM in bilingual material.
    const lo = await this.los.findById(args.lo_id);
    if (!lo) throw new BadRequestException('learning objective not found');
    const paper = await this.papers.findById(lo.paper_id);
    if (!paper) throw new BadRequestException('paper not found');

    // Fetch a sample of existing questions so the LLM doesn't regenerate the
    // same prompts. We only need their prompt_en to feed as "avoid duplicates"
    // context; sending full questions would blow the token budget.
    const existing = await this.questions.findByLo(lo.id);
    const existingPromptsEn = existing
      .slice(0, 50)              // hard cap to keep prompt size bounded
      .map((q) => q.prompt_en);

    // Build the prompt. Static hints first, admin override after — order matters
    // since the admin's freeform text is meant to refine or constrain the defaults.
    const staticHints = getTopicHints(paper.code, lo.code);
    const fullHints = [staticHints, args.hints.trim()].filter((s) => s.length > 0).join('\n\n');

    const prompt = this.buildPrompt({
      paper_code: paper.code,
      paper_name_en: paper.name_en,
      lo_code: lo.code,
      lo_title_en: lo.title_en,
      lo_title_ru: lo.title_ru,
      lo_description_en: lo.description_en,
      lo_description_ru: lo.description_ru,
      hints: fullHints,
      existingPromptsEn,
      count: args.count,
    });

    // Call the LLM. Single attempt — we don't retry because (a) retries cost
    // money and (b) if the model returns malformed JSON, retrying with the same
    // prompt usually returns the same malformed output. Better to surface the
    // error to the admin so they can adjust hints.
    const rawText = await this.callAnthropic(prompt);

    // Record successful API call against the bucket BEFORE parsing —
    // it cost money whether or not the response parses.
    this.recordRequest(args.admin_user_id);

    const parsed = this.parseLlmResponse(rawText);
    if (parsed.length === 0) {
      throw new ServiceUnavailableException(
        'generator returned no usable questions; try refining your hints',
      );
    }

    // Persist each question as is_active=false. We do this sequentially rather
    // than in a single tx because a bad question in the middle shouldn't roll
    // back the good ones — admins can delete junk individually.
    const inserted: QuestionRow[] = [];
    for (const q of parsed) {
      try {
        const input = this.toCreateInput(lo.id, q);
        const row = await this.questions.create(input);
        inserted.push(row);
      } catch (err) {
        // Log and skip; don't fail the whole batch on one bad row.
        this.log.warn(
          `failed to persist generated question for LO ${lo.id}: ${(err as Error).message}`,
        );
      }
    }

    if (inserted.length === 0) {
      throw new ServiceUnavailableException(
        'generator produced output but none of it could be persisted',
      );
    }

    return inserted;
  }

  // ---- rate limiting ----

  private assertWithinRateLimit(admin_user_id: string): void {
    const now = Date.now();
    const bucket = this.buckets.get(admin_user_id) ?? { timestamps: [] };
    // Drop timestamps outside the window.
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (bucket.timestamps.length >= RATE_LIMIT_PER_HOUR) {
      // Nest doesn't export TooManyRequestsException; HttpException with 429
      // serializes the same way to the client.
      throw new HttpException(
        `generation rate limit reached (${RATE_LIMIT_PER_HOUR} per hour); try again later`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.buckets.set(admin_user_id, bucket);
  }

  private recordRequest(admin_user_id: string): void {
    const bucket = this.buckets.get(admin_user_id) ?? { timestamps: [] };
    bucket.timestamps.push(Date.now());
    this.buckets.set(admin_user_id, bucket);
  }

  // ---- prompt construction ----

  private buildPrompt(ctx: {
    paper_code: string;
    paper_name_en: string;
    lo_code: string;
    lo_title_en: string;
    lo_title_ru: string | null;
    lo_description_en: string | null;
    lo_description_ru: string | null;
    hints: string;
    existingPromptsEn: string[];
    count: number;
  }): string {
    const existingBlock =
      ctx.existingPromptsEn.length > 0
        ? `\nQuestions already in the bank (DO NOT duplicate these or close paraphrases):\n${ctx.existingPromptsEn
            .map((p, i) => `${i + 1}. ${p}`)
            .join('\n')}\n`
        : '';

    const hintsBlock = ctx.hints.length > 0
      ? `\nTopic priority hints (what real ACCA exams emphasise for this LO):\n${ctx.hints}\n`
      : '';

    // The instructions ask for raw JSON only — no markdown fences, no preamble.
    // The parser still strips ```json fences defensively because some Anthropic
    // models add them even when told not to.
    const loTitleLine = ctx.lo_title_ru
      ? `- Learning Objective ${ctx.lo_code}: ${ctx.lo_title_en} / ${ctx.lo_title_ru}`
      : `- Learning Objective ${ctx.lo_code}: ${ctx.lo_title_en}`;
    return [
      `You are an expert ACCA exam content writer producing original practice questions.`,
      ``,
      `Context:`,
      `- Paper: ${ctx.paper_code} (${ctx.paper_name_en})`,
      loTitleLine,
      ctx.lo_description_en ? `- Description (EN): ${ctx.lo_description_en}` : '',
      ctx.lo_description_ru ? `- Description (RU): ${ctx.lo_description_ru}` : '',
      hintsBlock,
      existingBlock,
      `Generate exactly ${ctx.count} ORIGINAL practice questions for this LO. Requirements:`,
      ``,
      `1. Mix question types: roughly 60% "mcq", 25% "short_answer", 15% "number_entry". Use "number_entry" for questions whose correct answer is a single numeric value (calculations, variances, balances).`,
      `2. Mix difficulties: roughly 40% "easy", 40% "medium", 20% "hard".`,
      `3. For MCQ: exactly 4 options keyed A, B, C, D. Distractors must be plausible (common student mistakes), not silly. The correct option must be unambiguous.`,
      `4. For MCQ: EACH WRONG OPTION must include "why_wrong_en" and "why_wrong_ru" — one sentence each explaining the specific misconception the student would have if they picked that option. The CORRECT option must NOT have why_wrong fields (omit them or set to null). These are baked into the content so the student sees them on the feedback screen without an extra AI call.`,
      `5. For short_answer: the answer should fit in 1–2 sentences; for both EN and RU provide the canonical reference answer.`,
      `6. For number_entry: "correct_answer_en" must be a string containing the numeric value (e.g. "12500" or "0.85"). DO NOT include units, currency symbols, or commas in correct_answer_en. Omit "options". Omit "correct_answer_ru" (numbers are language-neutral). If the answer is a calculation where small rounding differences should be accepted, include "acceptable_tolerance" as a non-negative number (e.g. 0.5 to accept ±0.5).`,
      `7. Every question MUST have both English (prompt_en, options[].text_en, etc.) AND Russian (prompt_ru, options[].text_ru, etc.) versions. Russian must read NATURALLY in Russian, not a literal translation of English — write it independently using correct ACCA terminology in Russian (e.g. "маржинальный доход" for contribution, "отклонение по цене материалов" for material price variance).`,
      `8. Every question MUST have an explanation in both languages, 1–3 sentences, that teaches the underlying concept.`,
      `9. Optionally include "concept_bite_en" and "concept_bite_ru" — a one-sentence concept reminder that would appear BEFORE the question to prime the student.`,
      `10. Do NOT reproduce copyrighted past-paper content. Write originals inspired by exam style.`,
      `11. Do NOT generate questions that duplicate any in the existing question list above.`,
      ``,
      `Output: a single JSON array of exactly ${ctx.count} question objects. No prose, no markdown, no preamble. Shape:`,
      ``,
      `[`,
      `  {`,
      `    "type": "mcq",`,
      `    "difficulty": "easy" | "medium" | "hard",`,
      `    "prompt_en": "...",`,
      `    "prompt_ru": "...",`,
      `    "options": [`,
      `      {"key": "A", "text_en": "...", "text_ru": "..."},  // correct — no why_wrong`,
      `      {"key": "B", "text_en": "...", "text_ru": "...", "why_wrong_en": "...", "why_wrong_ru": "..."},`,
      `      {"key": "C", "text_en": "...", "text_ru": "...", "why_wrong_en": "...", "why_wrong_ru": "..."},`,
      `      {"key": "D", "text_en": "...", "text_ru": "...", "why_wrong_en": "...", "why_wrong_ru": "..."}`,
      `    ],`,
      `    "correct_answer_en": "A",`,
      `    "explanation_en": "...",`,
      `    "explanation_ru": "...",`,
      `    "concept_bite_en": "...",  // optional`,
      `    "concept_bite_ru": "..."   // optional`,
      `  },`,
      `  {`,
      `    "type": "short_answer",`,
      `    "difficulty": "medium",`,
      `    "prompt_en": "...",`,
      `    "prompt_ru": "...",`,
      `    "correct_answer_en": "canonical English answer",`,
      `    "correct_answer_ru": "канонический русский ответ",`,
      `    "explanation_en": "...",`,
      `    "explanation_ru": "..."`,
      `  },`,
      `  {`,
      `    "type": "number_entry",`,
      `    "difficulty": "medium",`,
      `    "prompt_en": "Calculate the closing inventory balance...",`,
      `    "prompt_ru": "Рассчитайте остаток запасов...",`,
      `    "correct_answer_en": "12500",`,
      `    "acceptable_tolerance": 0,    // optional; omit or set 0 for exact match`,
      `    "explanation_en": "...",`,
      `    "explanation_ru": "..."`,
      `  }`,
      `]`,
      ``,
      `Return ONLY the JSON array. No text before or after.`,
    ].filter((s) => s !== '').join('\n');
  }

  // ---- Anthropic API call ----

  private async callAnthropic(prompt: string): Promise<string> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'ANTHROPIC_API_KEY is not configured; question generation is unavailable',
      );
    }
    const model =
      this.config.get<string>('LLM_GENERATION_MODEL') ??
      this.config.get<string>('ANTHROPIC_MODEL') ??
      DEFAULT_MODEL;
    const timeoutMs = Number(
      this.config.get<string>('LLM_GENERATION_TIMEOUT_MS') ?? DEFAULT_TIMEOUT_MS,
    );

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 8000,                 // generous: 10 bilingual MCQs ≈ 4-6k tokens
          temperature: 0.7,                 // some variety; not so high we lose coherence
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new ServiceUnavailableException(
          `LLM API error ${res.status}: ${body.slice(0, 300)}`,
        );
      }

      const data = (await res.json()) as {
        content?: Array<{ type: string; text?: string }>;
      };
      const text = data.content?.find((b) => b.type === 'text')?.text;
      if (!text) {
        throw new ServiceUnavailableException('LLM returned no text content');
      }
      return text;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new ServiceUnavailableException(
          `LLM generation timed out after ${timeoutMs}ms`,
        );
      }
      if (err instanceof HttpException) throw err;
      throw new ServiceUnavailableException(`LLM call failed: ${(err as Error).message}`);
    } finally {
      clearTimeout(timer);
    }
  }

  // ---- response parsing + validation ----

  // Extract a JSON array from the LLM text and validate each entry.
  // Returns only the entries that pass validation; logs the rest.
  private parseLlmResponse(raw: string): LlmGeneratedQuestion[] {
    // Strip optional ```json fences.
    let text = raw.trim();
    const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/;
    const m = text.match(fence);
    if (m) text = m[1].trim();

    // Find the first '[' and matching last ']' — defensive in case the model
    // adds an explanatory sentence despite instructions.
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1 || end <= start) {
      throw new ServiceUnavailableException('LLM response was not a JSON array');
    }
    const jsonStr = text.slice(start, end + 1);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      throw new ServiceUnavailableException(
        `LLM JSON parse failed: ${(e as Error).message}`,
      );
    }
    if (!Array.isArray(parsed)) {
      throw new ServiceUnavailableException('LLM response root was not an array');
    }

    const valid: LlmGeneratedQuestion[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const err = this.validateLlmQuestion(parsed[i]);
      if (err) {
        this.log.warn(`question[${i}] discarded: ${err}`);
        continue;
      }
      valid.push(parsed[i] as LlmGeneratedQuestion);
    }
    return valid;
  }

  // Returns null if valid, or an error string if not.
  // Hand-written rather than class-validator because the input is a plain JSON
  // object that hasn't been class-transformed, and we want to discard individual
  // bad entries rather than fail the whole batch.
  private validateLlmQuestion(obj: unknown): string | null {
    if (typeof obj !== 'object' || obj === null) return 'not an object';
    const q = obj as Record<string, unknown>;

    if (q.type !== 'mcq' && q.type !== 'short_answer' && q.type !== 'number_entry') {
      return `bad type: ${String(q.type)}`;
    }
    if (q.difficulty !== 'easy' && q.difficulty !== 'medium' && q.difficulty !== 'hard') {
      return `bad difficulty: ${String(q.difficulty)}`;
    }
    if (typeof q.prompt_en !== 'string' || q.prompt_en.length < 5) return 'prompt_en missing/short';
    if (typeof q.prompt_ru !== 'string' || q.prompt_ru.length < 5) return 'prompt_ru missing/short';
    if (typeof q.explanation_en !== 'string' || q.explanation_en.length < 5) return 'explanation_en missing/short';
    if (typeof q.explanation_ru !== 'string' || q.explanation_ru.length < 5) return 'explanation_ru missing/short';
    if (typeof q.correct_answer_en !== 'string' || q.correct_answer_en.length === 0) {
      return 'correct_answer_en missing';
    }

    if (q.type === 'mcq') {
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return `mcq must have exactly 4 options, got ${Array.isArray(q.options) ? q.options.length : 'non-array'}`;
      }
      const keys = new Set<string>();
      for (const opt of q.options as unknown[]) {
        if (typeof opt !== 'object' || opt === null) return 'option not an object';
        const o = opt as Record<string, unknown>;
        if (typeof o.key !== 'string' || o.key.length === 0) return 'option.key missing';
        if (typeof o.text_en !== 'string' || o.text_en.length === 0) return 'option.text_en missing';
        if (typeof o.text_ru !== 'string' || o.text_ru.length === 0) return 'option.text_ru missing';
        if (keys.has(o.key)) return `duplicate option key ${o.key}`;
        keys.add(o.key);

        // why_wrong validation: correct option must not have it; wrong options
        // should have both EN+RU. We're lenient: missing why_wrong on a wrong
        // option is logged-discarded (the prompt asked for them), but tolerated
        // — admin can fill them in later. Only fail when types are wrong.
        if (o.why_wrong_en !== undefined && o.why_wrong_en !== null && typeof o.why_wrong_en !== 'string') {
          return `option ${o.key} why_wrong_en wrong type`;
        }
        if (o.why_wrong_ru !== undefined && o.why_wrong_ru !== null && typeof o.why_wrong_ru !== 'string') {
          return `option ${o.key} why_wrong_ru wrong type`;
        }
      }
      // correct_answer_en must point to one of the option keys.
      if (!keys.has(q.correct_answer_en)) {
        return `correct_answer_en "${q.correct_answer_en}" does not match any option key`;
      }
    } else if (q.type === 'number_entry') {
      // Must parse as a finite number. Same lenient parsing as the grader for
      // the strict-error case (commas stripped).
      const n = parseFloat(q.correct_answer_en.replace(/,/g, ''));
      if (!Number.isFinite(n)) {
        return `number_entry correct_answer_en "${q.correct_answer_en}" not numeric`;
      }
      // Tolerance, if present, must be a non-negative finite number.
      if (q.acceptable_tolerance !== undefined && q.acceptable_tolerance !== null) {
        if (typeof q.acceptable_tolerance !== 'number' || !Number.isFinite(q.acceptable_tolerance) || q.acceptable_tolerance < 0) {
          return `bad acceptable_tolerance: ${String(q.acceptable_tolerance)}`;
        }
      }
      // number_entry must not have options.
      if (q.options !== undefined && q.options !== null) {
        const o = q.options as unknown[];
        if (Array.isArray(o) && o.length > 0) {
          return 'number_entry must not have options';
        }
      }
    } else {
      // short_answer: correct_answer_ru must be present (separate from EN, not a key).
      if (typeof q.correct_answer_ru !== 'string' || q.correct_answer_ru.length === 0) {
        return 'short_answer missing correct_answer_ru';
      }
    }
    return null;
  }

  // ---- shape mapping ----

  // Convert a validated LLM question into the repo's create() input shape.
  // Differences are minor — mostly renaming keys + nulling out RU fields where
  // appropriate for MCQ (correct_answer_ru is unused for MCQ since the option
  // key is language-neutral). For number_entry, options are null and tolerance
  // (if any) flows through.
  //
  // Defensive normalisation:
  //   - On MCQ, the correct option's why_wrong is forced to null even if the
  //     LLM emitted text there — UI assumption is "why_wrong present ⇒ wrong".
  //   - Wrong options keep whatever why_wrong the LLM produced (may be null/
  //     undefined if it dropped them; admin fills in via edit later).
  private toCreateInput(lo_id: string, q: LlmGeneratedQuestion) {
    const isMcq = q.type === 'mcq';
    const isNumber = q.type === 'number_entry';

    let normalizedOptions: McqOption[] | null = null;
    if (isMcq && q.options) {
      normalizedOptions = q.options.map((opt) => {
        const isCorrect = opt.key === q.correct_answer_en;
        return {
          key: opt.key,
          text_en: opt.text_en,
          text_ru: opt.text_ru,
          why_wrong_en: isCorrect ? null : (opt.why_wrong_en ?? null),
          why_wrong_ru: isCorrect ? null : (opt.why_wrong_ru ?? null),
        };
      });
    }

    return {
      lo_id,
      type: q.type,
      difficulty: q.difficulty,
      prompt_en: q.prompt_en.trim(),
      prompt_ru: q.prompt_ru.trim(),
      options: normalizedOptions,
      correct_answer_en: q.correct_answer_en.trim(),
      // MCQ stores option key in _en and leaves _ru null; number_entry uses _en
      // for the numeric value (also language-neutral); only short_answer uses _ru.
      correct_answer_ru:
        isMcq || isNumber ? null : (q.correct_answer_ru ?? '').trim(),
      explanation_en: q.explanation_en.trim(),
      explanation_ru: q.explanation_ru.trim(),
      concept_bite_en: q.concept_bite_en?.trim() || null,
      concept_bite_ru: q.concept_bite_ru?.trim() || null,
      acceptable_tolerance: isNumber ? (q.acceptable_tolerance ?? null) : null,
      is_active: false,                         // <-- the key bit: drafts, not live
    };
  }
}
