import { api } from "./client";

// Mirrors backend src/profile/public-profile.service.ts PublicProfileResponse.
export interface PublicProfileBadge {
  code: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string | null;
}

export interface PublicProfileResponse {
  id: string;
  display_name: string;
  level: number;
  xp: number;
  streak_count: number;
  created_at: string;
  total_lessons: number;
  accuracy_pct: number | null;
  badges: PublicProfileBadge[];
}

export const publicProfileApi = {
  getById: async (id: string): Promise<PublicProfileResponse> =>
    (await api.get<PublicProfileResponse>(`/users/${id}/public-profile`)).data,
};
