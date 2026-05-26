import { api } from "./client";
import type {
  ContentTreePaper,
  LearningObjectiveRaw,
  McqOptionRaw,
  PaperRaw,
  QuestionRaw,
  QuestionDifficulty,
  QuestionType,
  UiTranslation,
} from "../types/content";
import type { PublicUser } from "../types/auth";
import type { WhitelistEntry } from "../types/whitelist";

// Mirrors backend AdminOverviewController response. Kept inline here rather
// than a dedicated types file because the shape is small and used only by
// the admin overview page.
export interface AdminOverview {
  users: {
    total: number;
    admins: number;
    reminders_enabled: number;
    new_last_7d: number;
  };
  premium: {
    active: number;
    active_users: number;
  };
  activity: {
    lessons_last_7d: number;
    mocks_last_7d: number;
    active_users_last_24h: number;
  };
  content: {
    papers: number;
    learning_objectives: number;
    questions_active: number;
    questions_inactive: number;
  };
}

// All endpoints below require an authenticated admin. Axios attaches the bearer
// token automatically via the interceptor in client.ts.
// Admin endpoints return RAW i18n shapes (both _en and _ru) so the editor can
// edit either language.
export const adminApi = {
  // ---- Overview (admin landing dashboard) ----
  // Returns at-a-glance counts: users / premium / recent activity / content.
  getOverview: async (): Promise<AdminOverview> =>
    (await api.get<AdminOverview>("/admin/overview")).data,

  // ---- Users (admin management) ----
  listUsers: async (): Promise<PublicUser[]> =>
    (await api.get<PublicUser[]>("/admin/users")).data,

  // Full single-user detail for the admin user-detail page. Returns the
  // public user shape plus `created_at` / `updated_at` / `last_active_date`
  // so the admin can see when the user joined and last engaged.
  getUser: async (
    id: string
  ): Promise<
    PublicUser & {
      created_at: string;
      updated_at: string;
      timezone: string;
      last_active_date: string | null;
    }
  > => (await api.get(`/admin/users/${id}`)).data,

  setUserAdmin: async (id: string, is_admin: boolean): Promise<PublicUser> =>
    (await api.patch<PublicUser>(`/admin/users/${id}/admin`, { is_admin }))
      .data,

  // ---- Papers ----
  listPapers: async (): Promise<PaperRaw[]> =>
    (await api.get<PaperRaw[]>("/admin/papers")).data,

  createPaper: async (input: {
    code: string;
    name_en: string;
    name_ru?: string | null;
    // Defaults true on the backend; pass false to create a premium-only paper.
    free_accessible?: boolean;
  }): Promise<PaperRaw> =>
    (await api.post<PaperRaw>("/admin/papers", input)).data,

  // Single-paper fetch — needed by the inline edit modal in AdminContentPage
  // so we know the current free_accessible flag (the content tree doesn't
  // include it, to keep that payload small).
  getPaper: async (id: string): Promise<PaperRaw> =>
    (await api.get<PaperRaw>(`/admin/papers/${id}`)).data,

  updatePaper: async (
    id: string,
    input: Partial<{
      code: string;
      name_en: string;
      name_ru: string | null;
      free_accessible: boolean;
    }>
  ): Promise<PaperRaw> =>
    (await api.patch<PaperRaw>(`/admin/papers/${id}`, input)).data,

  deletePaper: async (id: string): Promise<void> => {
    await api.delete(`/admin/papers/${id}`);
  },

  // ---- Learning Objectives ----
  listLos: async (paper_id: string): Promise<LearningObjectiveRaw[]> =>
    (await api.get<LearningObjectiveRaw[]>(`/admin/papers/${paper_id}/los`))
      .data,

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
      theory_en?: string | null;
      theory_ru?: string | null;
      sort_order?: number;
    }
  ): Promise<LearningObjectiveRaw> =>
    (
      await api.post<LearningObjectiveRaw>(
        `/admin/papers/${paper_id}/los`,
        input
      )
    ).data,

  updateLo: async (
    id: string,
    input: Partial<{
      code: string;
      title_en: string;
      title_ru: string | null;
      description_en: string | null;
      description_ru: string | null;
      theory_en: string | null;
      theory_ru: string | null;
      sort_order: number;
    }>
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
      acceptable_tolerance?: number | null;
    }
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
      acceptable_tolerance: number | null;
      is_active: boolean;
    }>
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
    input: { count: number; hints?: string }
  ): Promise<QuestionRaw[]> =>
    (
      await api.post<QuestionRaw[]>(
        `/admin/los/${lo_id}/questions/generate`,
        input
      )
    ).data,

  // ---- Content tree (admin browser) ----
  // Returns papers nested with their LOs and per-LO question counts. One
  // network call powers the sidebar tree on the content browser page.
  getContentTree: async (): Promise<ContentTreePaper[]> =>
    (await api.get<ContentTreePaper[]>("/admin/content/tree")).data,

  // Bulk-set is_active on multiple questions. Returns the updated rows.
  setQuestionsActive: async (
    ids: string[],
    is_active: boolean
  ): Promise<QuestionRaw[]> =>
    (
      await api.post<QuestionRaw[]>("/admin/questions/batch/active", {
        ids,
        is_active,
      })
    ).data,

  // Bulk hard-delete. Throws 400 if any selected question has dependent
  // attempts (entire batch rolls back in that case).
  deleteQuestionsMany: async (ids: string[]): Promise<{ deleted: number }> =>
    (
      await api.post<{ deleted: number }>("/admin/questions/batch/delete", {
        ids,
      })
    ).data,

  // ---- UI translations (DB overrides for static locale strings) ----
  listUiTranslations: async (): Promise<UiTranslation[]> =>
    (await api.get<UiTranslation[]>("/admin/ui-translations")).data,

  upsertUiTranslation: async (input: {
    key: string;
    lang: "en" | "ru";
    value: string;
  }): Promise<UiTranslation> =>
    (await api.post<UiTranslation>("/admin/ui-translations", input)).data,

  deleteUiTranslation: async (
    key: string,
    lang: "en" | "ru"
  ): Promise<void> => {
    await api.delete(
      `/admin/ui-translations/${lang}/${encodeURIComponent(key)}`
    );
  },

  // ---- Whitelist ----
  // Entries can be either exact emails (user@example.com) or domains
  // (@example.com). Backend validates the shape; admin UI shows a chip per
  // entry indicating which kind it is.
  listWhitelist: async (): Promise<WhitelistEntry[]> =>
    (await api.get<WhitelistEntry[]>("/admin/whitelist")).data,

  addWhitelist: async (input: {
    pattern: string;
    note?: string | null;
  }): Promise<WhitelistEntry> =>
    (await api.post<WhitelistEntry>("/admin/whitelist", input)).data,

  updateWhitelistNote: async (
    id: string,
    note: string | null
  ): Promise<WhitelistEntry> =>
    (await api.patch<WhitelistEntry>(`/admin/whitelist/${id}/note`, { note }))
      .data,

  deleteWhitelist: async (id: string): Promise<void> => {
    await api.delete(`/admin/whitelist/${id}`);
  },

  // ---- System (destructive admin operations) ----
  // Drops all content + per-user progress, then reseeds the bundled catalog.
  // Used by the "Drop DB & reseed" button in the admin content browser.
  // Throws 429 if hammered (backend throttles to 3/min).
  systemReseed: async (): Promise<{
    papers_dropped: number;
    papers_inserted: number;
    badges_upserted: number;
    questions_inserted: number;
    attempts_deleted: number;
    sessions_deleted: number;
    uqs_deleted: number;
    user_badges_deleted: number;
    mastery_snapshots_deleted: number;
    users_progress_reset: number;
  }> => (await api.post("/admin/system/reseed")).data,
};
