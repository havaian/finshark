import { api } from './client';
import type { PublicUser } from '../types/auth';

export interface ProfileMe extends PublicUser {
  created_at: string;
}

export interface AccuracyByPaperRow {
  paper_id: string;
  paper_code: string;
  paper_name: string;
  attempts: number;
  correct: number;
  accuracy_pct: number;
}

export interface DifficultyBreakdownRow {
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  correct: number;
}

export interface TypeBreakdownRow {
  type: 'mcq' | 'short_answer' | 'number_entry';
  attempts: number;
  correct: number;
}

export interface ActivityHeatmapRow {
  day: string;
  attempts_count: number;
}

export interface MasterySnapshotRow {
  snap_date: string;
  avg_mastery: number;
}

export interface ProfileStats {
  overall: {
    total_sessions_completed: number;
    total_questions_answered: number;
    total_correct: number;
    accuracy_pct: number | null;
  };
  accuracy_by_paper: AccuracyByPaperRow[];
  difficulty_breakdown: DifficultyBreakdownRow[];
  type_breakdown: TypeBreakdownRow[];
  activity_heatmap: ActivityHeatmapRow[];
  mastery_history: MasterySnapshotRow[];
}

export interface UpdatePreferencesPayload {
  reminder_hour_utc?: number;
  preferred_difficulty?: 'easy' | 'medium' | 'hard' | null;
  lesson_size?: number;
  email_reminders_enabled?: boolean;
  // Leaderboards opt-in (3.3). Settings toggle + leaderboard page banner
  // both flip this through the same PATCH endpoint.
  leaderboard_opt_in?: boolean;
}

export const profileApi = {
  getMe: async (): Promise<ProfileMe> =>
    (await api.get<ProfileMe>('/me')).data,

  updateDisplayName: async (display_name: string): Promise<PublicUser> =>
    (await api.patch<PublicUser>('/me', { display_name })).data,

  updatePreferences: async (payload: UpdatePreferencesPayload): Promise<PublicUser> =>
    (await api.patch<PublicUser>('/me/preferences', payload)).data,

  getStats: async (): Promise<ProfileStats> =>
    (await api.get<ProfileStats>('/me/stats')).data,

  deleteAccount: async (confirm_email: string): Promise<void> => {
    // Axios delete with body — needs the `data` option, not the 2nd positional.
    await api.delete('/me', { data: { confirm_email } });
  },
};
