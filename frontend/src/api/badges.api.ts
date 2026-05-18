import { api } from "./client";
import type { PublicBadge } from "../types/badges";

export const badgesApi = {
  // GET /me/badges → full catalog with `earned` flag per badge for the
  // current user. Bilingual: backend reads Accept-Language (set by the
  // axios interceptor based on the active locale) and returns the right
  // copy strings.
  getMine: async (): Promise<PublicBadge[]> =>
    (await api.get<PublicBadge[]>("/me/badges")).data,
};
