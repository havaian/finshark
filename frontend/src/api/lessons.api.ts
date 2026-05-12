import { api } from './client';
import type {
  AttemptResult,
  CompleteLessonResult,
  SessionDetail,
  StartLessonResult,
} from '../types/lesson';
import type { Paper } from '../types/content';

export const lessonsApi = {
  // Public-but-authed: paper picker on dashboard
  listPapers: async (): Promise<Paper[]> => (await api.get<Paper[]>('/papers')).data,

  start: async (input: { paper_id?: string; size?: number }): Promise<StartLessonResult> =>
    (await api.post<StartLessonResult>('/lessons/start', input)).data,

  getSession: async (session_id: string): Promise<SessionDetail> =>
    (await api.get<SessionDetail>(`/lessons/${session_id}`)).data,

  attempt: async (
    session_id: string,
    input: { question_id: string; user_answer: string },
  ): Promise<AttemptResult> =>
    (await api.post<AttemptResult>(`/lessons/${session_id}/attempt`, input)).data,

  complete: async (session_id: string): Promise<CompleteLessonResult> =>
    (await api.post<CompleteLessonResult>(`/lessons/${session_id}/complete`, {})).data,
};
