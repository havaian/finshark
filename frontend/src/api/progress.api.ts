import { api } from "./client";
import type { ProgressResponse } from "../types/progress";

export const progressApi = {
  get: async (): Promise<ProgressResponse> =>
    (await api.get<ProgressResponse>("/progress")).data,
};
