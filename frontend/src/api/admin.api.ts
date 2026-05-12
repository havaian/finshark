import { api } from './client';
import type {
  LearningObjective,
  McqOption,
  Paper,
  Question,
  QuestionDifficulty,
  QuestionType,
} from '../types/content';

// All endpoints below require an authenticated admin. Axios attaches the bearer token
// automatically via the interceptor in client.ts.
export const adminApi = {
  // Papers
  listPapers: async (): Promise<Paper[]> =>
    (await api.get<Paper[]>('/admin/papers')).data,

  createPaper: async (input: { code: string; name: string }): Promise<Paper> =>
    (await api.post<Paper>('/admin/papers', input)).data,

  updatePaper: async (id: string, input: Partial<{ code: string; name: string }>): Promise<Paper> =>
    (await api.patch<Paper>(`/admin/papers/${id}`, input)).data,

  deletePaper: async (id: string): Promise<void> => {
    await api.delete(`/admin/papers/${id}`);
  },

  // Learning Objectives
  listLos: async (paper_id: string): Promise<LearningObjective[]> =>
    (await api.get<LearningObjective[]>(`/admin/papers/${paper_id}/los`)).data,

  getLo: async (id: string): Promise<LearningObjective> =>
    (await api.get<LearningObjective>(`/admin/los/${id}`)).data,

  createLo: async (
    paper_id: string,
    input: { code: string; title: string; description?: string | null; sort_order?: number },
  ): Promise<LearningObjective> =>
    (await api.post<LearningObjective>(`/admin/papers/${paper_id}/los`, input)).data,

  updateLo: async (
    id: string,
    input: Partial<{
      code: string;
      title: string;
      description: string | null;
      sort_order: number;
    }>,
  ): Promise<LearningObjective> =>
    (await api.patch<LearningObjective>(`/admin/los/${id}`, input)).data,

  deleteLo: async (id: string): Promise<void> => {
    await api.delete(`/admin/los/${id}`);
  },

  // Questions
  listQuestions: async (lo_id: string): Promise<Question[]> =>
    (await api.get<Question[]>(`/admin/los/${lo_id}/questions`)).data,

  createQuestion: async (
    lo_id: string,
    input: {
      type: QuestionType;
      difficulty: QuestionDifficulty;
      prompt: string;
      options: McqOption[] | null;
      correct_answer: string;
      explanation: string;
      concept_bite?: string | null;
    },
  ): Promise<Question> =>
    (await api.post<Question>(`/admin/los/${lo_id}/questions`, input)).data,

  updateQuestion: async (
    id: string,
    input: Partial<{
      type: QuestionType;
      difficulty: QuestionDifficulty;
      prompt: string;
      options: McqOption[] | null;
      correct_answer: string;
      explanation: string;
      concept_bite: string | null;
      is_active: boolean;
    }>,
  ): Promise<Question> =>
    (await api.patch<Question>(`/admin/questions/${id}`, input)).data,

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/admin/questions/${id}`);
  },
};
