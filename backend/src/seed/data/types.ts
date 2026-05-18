// Shared types for seed content files. These describe the input shape — the
// seed runner does the actual DB insert mapping.

export type SeedDifficulty = 'easy' | 'medium' | 'hard';
export type SeedQuestionType = 'mcq' | 'short_answer' | 'number_entry';

export interface SeedMcqOption {
  key: string;
  text_en: string;
  text_ru: string;
  // Per-option "why this is wrong" — optional during seed authoring, but
  // strongly encouraged for wrong options. The correct option must NOT have
  // these set (validated/scrubbed in the service layer; the seed runner
  // also nulls them out for the correct option as a belt-and-braces).
  why_wrong_en?: string;
  why_wrong_ru?: string;
}

// Discriminated by `type`. For MCQ, `options` is required and `correct_answer_en`
// holds the option key (language-neutral). For short_answer, `options` is absent
// and `correct_answer_en` / `correct_answer_ru` hold canonical text in each language.
// For number_entry, `options` is absent, `correct_answer_en` holds the numeric
// value as a string (e.g. "12500"), and `acceptable_tolerance` (optional) sets ±X.
export interface SeedMcqQuestion {
  type: 'mcq';
  difficulty: SeedDifficulty;
  prompt_en: string;
  prompt_ru: string;
  options: SeedMcqOption[];
  correct_answer_en: string;        // option key, e.g. 'A'
  explanation_en: string;
  explanation_ru: string;
  concept_bite_en?: string;
  concept_bite_ru?: string;
}

export interface SeedShortAnswerQuestion {
  type: 'short_answer';
  difficulty: SeedDifficulty;
  prompt_en: string;
  prompt_ru: string;
  correct_answer_en: string;        // canonical English answer
  correct_answer_ru: string;        // canonical Russian answer
  explanation_en: string;
  explanation_ru: string;
  concept_bite_en?: string;
  concept_bite_ru?: string;
}

export interface SeedNumberEntryQuestion {
  type: 'number_entry';
  difficulty: SeedDifficulty;
  prompt_en: string;
  prompt_ru: string;
  correct_answer_en: string;        // numeric value as string, no commas/units
  acceptable_tolerance?: number;    // optional ±X tolerance; omit for exact match
  explanation_en: string;
  explanation_ru: string;
  concept_bite_en?: string;
  concept_bite_ru?: string;
}

export type SeedQuestion =
  | SeedMcqQuestion
  | SeedShortAnswerQuestion
  | SeedNumberEntryQuestion;

export interface SeedLearningObjective {
  code: string;                     // e.g. 'A', 'B'
  title_en: string;
  title_ru: string;
  description_en: string;
  description_ru: string;
  sort_order: number;
  // Optional long-form theory bite per LO (150-300 words). Surfaces as a
  // pre-lesson primer and is the building block for a future read-only study
  // mode. Optional during early seed authoring; populated as content matures.
  theory_en?: string;
  theory_ru?: string;
  questions: SeedQuestion[];
}

export interface SeedPaper {
  code: string;                     // e.g. 'F1', 'F5'
  name_en: string;
  name_ru: string;
  learning_objectives: SeedLearningObjective[];
}
