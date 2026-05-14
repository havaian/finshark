import { api } from './client';
import type {
  LearningObjectiveRaw,
  McqOptionRaw,
  PaperRaw,
  QuestionRaw,
  QuestionDifficulty,
  QuestionType,
  UiTranslation,
} from '../types/content';
import type { PublicUser } from '../types/auth';

// All endpoints below require an authenticated admin. Axios attaches the bearer
// token automatically via the interceptor in client.ts.
// Admin endpoints return RAW i18n shapes (both _en and _ru) so the editor can
// edit either language.
export const adminApi = {
  // ---- Users (admin management) ----
  listUsers: async (): Promise<PublicUser[]> =>
    (await api.get<PublicUser[]>('/admin/users')).data,

  setUserAdmin: async (id: string, is_admin: boolean): Promise<PublicUser> =>
    (await api.patch<PublicUser>(`/admin/users/${id}/admin`, { is_admin })).data,

  // ---- Papers ----
  listPapers: async (): Promise<PaperRaw[]> =>
    (await api.get<PaperRaw[]>('/admin/papers')).data,

  createPaper: async (input: {
    code: string;
    name_en: string;
    name_ru?: string | null;
  }): Promise<PaperRaw> =>
    (await api.post<PaperRaw>('/admin/papers', input)).data,

  updatePaper: async (
    id: string,
    input: Partial<{
      code: string;
      name_en: string;
      name_ru: string | null;
    }>,
  ): Promise<PaperRaw> =>
    (await api.patch<PaperRaw>(`/admin/papers/${id}`, input)).data,

  deletePaper: async (id: string): Promise<void> => {
    await api.delete(`/admin/papers/${id}`);
  },

  // ---- Learning Objectives ----
  listLos: async (paper_id: string): Promise<LearningObjectiveRaw[]> =>
    (await api.get<LearningObjectiveRaw[]>(`/admin/papers/${paper_id}/los`)).data,

  getLo: async (id: string): Promise<LearningObjectiveRaw> =>
    (await api.get<LearningObjectiveRaw>(`/admin/los/${id}`)).data,

  createLo: async (
    paper_id: string,
    input: {
      code: string;
      title_en: string;
      title_ru?: string | null;
      description_en?: string | null;
      description_ru?: string | null;
      sort_order?: number;
    },
  ): Promise<LearningObjectiveRaw> =>
    (await api.post<LearningObjectiveRaw>(`/admin/papers/${paper_id}/los`, input))
      .data,

  updateLo: async (
    id: string,
    input: Partial<{
      code: string;
      title_en: string;
      title_ru: string | null;
      description_en: string | null;
      description_ru: string | null;
      sort_order: number;
    }>,
  ): Promise<LearningObjectiveRaw> =>
    (await api.patch<LearningObjectiveRaw>(`/admin/los/${id}`, input)).data,

  deleteLo: async (id: string): Promise<void> => {
    await api.delete(`/admin/los/${id}`);
  },

  // ---- Questions ----
  listQuestions: async (lo_id: string): Promise<QuestionRaw[]> =>
    (await api.get<QuestionRaw[]>(`/admin/los/${lo_id}/questions`)).data,

  createQuestion: async (
    lo_id: string,
    input: {
      type: QuestionType;
      difficulty: QuestionDifficulty;
      prompt_en: string;
      prompt_ru?: string | null;
      options: McqOptionRaw[] | null;
      correct_answer_en: string;
      correct_answer_ru?: string | null;
      explanation_en: string;
      explanation_ru?: string | null;
      concept_bite_en?: string | null;
      concept_bite_ru?: string | null;
    },
  ): Promise<QuestionRaw> =>
    (await api.post<QuestionRaw>(`/admin/los/${lo_id}/questions`, input)).data,

  updateQuestion: async (
    id: string,
    input: Partial<{
      type: QuestionType;
      difficulty: QuestionDifficulty;
      prompt_en: string;
      prompt_ru: string | null;
      options: McqOptionRaw[] | null;
      correct_answer_en: string;
      correct_answer_ru: string | null;
      explanation_en: string;
      explanation_ru: string | null;
      concept_bite_en: string | null;
      concept_bite_ru: string | null;
      is_active: boolean;
    }>,
  ): Promise<QuestionRaw> =>
    (await api.patch<QuestionRaw>(`/admin/questions/${id}`, input)).data,

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/admin/questions/${id}`);
  },

  // Generate draft questions via LLM. Returns the inserted (is_active=false)
  // rows. Backend enforces rate limits and validates the LLM output before
  // persisting; partial successes can occur if some generated questions failed
  // validation. The returned length is the actual count inserted.
  generateQuestions: async (
    lo_id: string,
    input: { count: number; hints?: string },
  ): Promise<QuestionRaw[]> =>
    (await api.post<QuestionRaw[]>(`/admin/los/${lo_id}/questions/generate`, input)).data,

  // ---- UI translations (DB overrides for static locale strings) ----
  listUiTranslations: async (): Promise<UiTranslation[]> =>
    (await api.get<UiTranslation[]>('/admin/ui-translations')).data,

  upsertUiTranslation: async (input: {
    key: string;
    lang: 'en' | 'ru';
    value: string;
  }): Promise<UiTranslation> =>
    (await api.post<UiTranslation>('/admin/ui-translations', input)).data,

  deleteUiTranslation: async (key: string, lang: 'en' | 'ru'): Promise<void> => {
    await api.delete(`/admin/ui-translations/${lang}/${encodeURIComponent(key)}`);
  },
};
