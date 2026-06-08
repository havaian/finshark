import { api } from "./client";
import type {
  MockAnswers,
  MockBreakdown,
  StartMockResult,
} from "../types/mocks";

export const mocksApi = {
  // POST /mocks → start a new mock session. The exam format (questions, marks,
  // duration) comes from the paper's exam_structure, so only the paper is sent.
  start: async (input: { paper_id: string }): Promise<StartMockResult> =>
    (await api.post<StartMockResult>("/mocks", input)).data,

  // GET /mocks/:id/breakdown → per-LO accuracy + wrong question IDs.
  breakdown: async (session_id: string): Promise<MockBreakdown> =>
    (await api.get<MockBreakdown>(`/mocks/${session_id}/breakdown`)).data,

  // GET /mocks/:id/answers → full per-question review payload. Used by the
  // MockReviewPage to render a read-only walkthrough of each question, the
  // user's answer, the correct answer, and the explanation. Separate from
  // `startReview` (which spins up a practice lesson) - this is the
  // "show me what I got wrong" view.
  answers: async (session_id: string): Promise<MockAnswers> =>
    (await api.get<MockAnswers>(`/mocks/${session_id}/answers`)).data,

  // POST /mocks/:id/review → start a regular lesson session with wrong Qs.
  // Returns the same shape as start() so callers can navigate to the resulting
  // session_id and reuse the lesson UI.
  startReview: async (session_id: string): Promise<StartMockResult> =>
    (await api.post<StartMockResult>(`/mocks/${session_id}/review`, {})).data,
};
