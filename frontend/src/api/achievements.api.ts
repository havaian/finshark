import { api } from "./client";
import type {
  PublicAchievement,
  PublicEarnedAchievement,
} from "../types/achievements";

export const achievementsApi = {
  // GET /me/achievements → full catalog with per-achievement progress for
  // the current user. Localised via X-Lang header (set by the axios
  // interceptor based on the active i18n locale).
  getMine: async (): Promise<PublicAchievement[]> =>
    (await api.get<PublicAchievement[]>("/me/achievements")).data,

  // GET /users/:id/achievements → earned-only (level >= 1) for someone
  // else's public profile. Returns [] if the user has no unlocks.
  getForUser: async (userId: string): Promise<PublicEarnedAchievement[]> =>
    (await api.get<PublicEarnedAchievement[]>(`/users/${userId}/achievements`))
      .data,
};
