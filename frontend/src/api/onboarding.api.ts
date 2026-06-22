import { api } from "./client";
import type { BgLevel, PublicUser } from "../types/auth";

export interface OnboardingStatus {
  onboarded: boolean;
  onboarded_at: string | null;
  bg_level: BgLevel | null;
  time_budget_minutes: number;
  preferred_paper_id: string | null;
}

export interface CompleteOnboardingInput {
  bg_level?: BgLevel;
  time_budget_minutes?: number;
  preferred_paper_id?: string;
  email_reminders_enabled?: boolean;
  // Optional next exam date 'YYYY-MM-DD'. Validated server-side (today-or-later,
  // within a few years). Omit when the user didn't pick one.
  exam_date?: string | null;
}

export const onboardingApi = {
  // Used by the route guard. Cheap (single users-row read).
  getStatus: async (): Promise<OnboardingStatus> =>
    (await api.get<OnboardingStatus>("/onboarding/status")).data,

  // Empty body = skip path (just stamps onboarded_at). Returns updated PublicUser
  // so the auth store can refresh in one call without a follow-up /me request.
  complete: async (input: CompleteOnboardingInput): Promise<PublicUser> =>
    (await api.post<PublicUser>("/onboarding/complete", input)).data,
};
