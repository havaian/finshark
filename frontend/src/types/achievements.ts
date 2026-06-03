// Mirrors backend src/achievements/achievements.types.ts.
//
// PublicAchievement is the full payload for /me/achievements - includes
// progress fields so the UI can render progress bars and "next level"
// labels. Locked achievements (current_level=0) come through with the same
// shape, just with current_level=0, current_level_name=null, and
// next_threshold pointing at level 1.

export interface PublicAchievementLevel {
  level: number;
  threshold: number;
  name: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface PublicAchievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  current_value: number;
  current_level: number;
  max_level: number;
  current_level_name: string | null;
  next_threshold: number | null;
  next_level_name: string | null;
  levels: PublicAchievementLevel[];
}

// Earned-only shape returned by GET /users/:id/achievements. Strips
// progress info - outsiders only see the unlocked-level summary.
export interface PublicEarnedAchievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  current_level: number;
  current_level_name: string;
  unlocked_at: string | null;
}
