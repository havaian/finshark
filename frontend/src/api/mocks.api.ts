import { api } from "./client";
import type { MockBreakdown, StartMockResult } from "../types/mocks";

export const mocksApi = {
  // POST /mocks → start a new mock session.
  start: async (input: {
    paper_id: string;
    question_count: number;
    time_limit_seconds?: number;
  }): Promise<StartMockResult> =>
    (await api.post<StartMockResult>("/mocks", input)).data,

  // GET /mocks/:id/breakdown → per-LO accuracy + wrong question IDs.
  breakdown: async (session_id: string): Promise<MockBreakdown> =>
    (await api.get<MockBreakdown>(`/mocks/${session_id}/breakdown`)).data,

  // POST /mocks/:id/review → start a regular lesson session with wrong Qs.
  // Returns the same shape as start() so callers can navigate to the resulting
  // session_id and reuse the lesson UI.
  startReview: async (session_id: string): Promise<StartMockResult> =>
    (await api.post<StartMockResult>(`/mocks/${session_id}/review`, {})).data,
};
