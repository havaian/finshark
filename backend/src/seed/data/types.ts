// Shared types for seed content files. These describe the input shape — the
// seed runner does the actual DB insert mapping.

export type SeedDifficulty = 'easy' | 'medium' | 'hard';
export type SeedQuestionType = 'mcq' | 'short_answer';

export interface SeedMcqOption {
  key: string;
  text_en: string;
  text_ru: string;
}

// Discriminated by `type`. For MCQ, `options` is required and `correct_answer_en`
// holds the option key (language-neutral). For short_answer, `options` is absent
// and `correct_answer_en` / `correct_answer_ru` hold canonical text in each language.
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

export type SeedQuestion = SeedMcqQuestion | SeedShortAnswerQuestion;

export interface SeedLearningObjective {
  code: string;                     // e.g. 'A', 'B'
  title_en: string;
  title_ru: string;
  description_en: string;
  description_ru: string;
  sort_order: number;
  questions: SeedQuestion[];
}

export interface SeedPaper {
  code: string;                     // e.g. 'F1', 'F5'
  name_en: string;
  name_ru: string;
  learning_objectives: SeedLearningObjective[];
}
