// Pure functions implementing SM-2 + mastery + XP/level math.
// Kept side-effect-free on purpose so they can be unit-tested without DB.

export interface SrsState {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_date: Date;
}

// SM-2: derive quality from a binary correct/wrong.
// We pick q=4 for correct (good recall, not perfect), q=1 for wrong (incorrect).
export function qualityFromCorrect(was_correct: boolean): number {
  return was_correct ? 4 : 1;
}

// Reference: https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
export function applySm2(
  prev: SrsState,
  quality: number,
  today: Date
): SrsState {
  // Ease factor adjustment.
  // EF' = EF + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02))
  const efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  let ease_factor = prev.ease_factor + efDelta;
  if (ease_factor < 1.3) ease_factor = 1.3;

  let repetitions = prev.repetitions;
  let interval_days: number;

  if (quality < 3) {
    // Failure: reset the streak; next review tomorrow.
    repetitions = 0;
    interval_days = 1;
  } else {
    // First-correct interval bumped from textbook SM-2's 1 day to 3 days.
    // Rationale: stock SM-2 puts a just-answered-correctly card back the very
    // next day, which felt repetitive for users - getting an easy question
    // right and seeing it again 24h later is more annoying than useful.
    // 3 days is still inside the typical "consolidation window" so we don't
    // lose retention benefits. Second-correct stays at 6 days (textbook).
    if (repetitions === 0) {
      interval_days = 3;
    } else if (repetitions === 1) {
      interval_days = 6;
    } else {
      interval_days = Math.round(prev.interval_days * ease_factor);
    }
    repetitions = repetitions + 1;
  }

  const due_date = addDays(today, interval_days);
  return { ease_factor, interval_days, repetitions, due_date };
}

// Mastery: +10 correct, -20 wrong, clamped [0,100]. Per spec.
export function applyMastery(
  prev_mastery: number,
  was_correct: boolean
): number {
  const delta = was_correct ? 10 : -20;
  const next = prev_mastery + delta;
  if (next < 0) return 0;
  if (next > 100) return 100;
  return next;
}

// XP scoring. Two axes:
//   - Outcome: correct vs first-encounter-wrong vs repeat-wrong (0).
//   - Difficulty: easy/medium/hard. Tougher questions reward more XP so a
//     user grinding 50 easy MCQs doesn't dominate someone who powered through
//     20 hards.
//
// Tables below are the per-difficulty values. Easy stays at the historical
// XP_PER_CORRECT=10 / XP_PER_FIRST_WRONG=2 so existing users don't see a
// regression on the lessons they're already doing. Medium and hard get
// proportional bumps. Repeat wrongs continue to award 0 - that's a mastery
// signal handled by the SRS interval, not a learning event.
//
// Tuning notes:
//   - Hard correct = 14 (1.4×). Big enough to reward but small enough that
//     a single hard ≠ two easies.
//   - First-wrong scales sub-linearly (2/3/4) so the partial-credit signal
//     stays visible without making "guessing hard" the rational strategy.
export type QuestionDifficulty = "easy" | "medium" | "hard";

const XP_CORRECT_BY_DIFFICULTY: Record<QuestionDifficulty, number> = {
  easy: 10,
  medium: 12,
  hard: 14,
};

const XP_FIRST_WRONG_BY_DIFFICULTY: Record<QuestionDifficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};

// Back-compat constants. Old callers / tests that hard-coded 10 / 2 keep
// working; new code should call xpForAttempt() below.
export const XP_PER_CORRECT = XP_CORRECT_BY_DIFFICULTY.easy;
export const XP_PER_FIRST_WRONG = XP_FIRST_WRONG_BY_DIFFICULTY.easy;

// Single source of truth for "how much XP did this attempt earn." Callers
// pass the question's difficulty + outcome + first-encounter flag.
//
// Returns 0 for repeat wrongs.
export function xpForAttempt(input: {
  difficulty: QuestionDifficulty;
  was_correct: boolean;
  is_first_encounter: boolean;
}): number {
  if (input.was_correct) return XP_CORRECT_BY_DIFFICULTY[input.difficulty];
  if (input.is_first_encounter) {
    return XP_FIRST_WRONG_BY_DIFFICULTY[input.difficulty];
  }
  return 0;
}

// Streak-XP bonus. Earned in the session-complete path. Multiplier =
// 1 + min(streak * STREAK_XP_BONUS_PER_DAY, STREAK_XP_BONUS_CAP).
//
// At streak=1 → +1% (negligible). At streak=50 → +50% (capped). The bonus
// makes the streak feel valuable for every lesson, not just at milestones,
// without making it dominate a user's XP total. Cap exists so the curve
// flattens once the user is reliably daily - past 50 days the marginal
// motivation is intrinsic, not extrinsic.
//
// Applied AFTER summing per-attempt XP and BEFORE writing to users.xp, so
// the "this session: +X XP (incl. +Y streak bonus)" framing is clean on the
// finale screen.
export const STREAK_XP_BONUS_PER_DAY = 0.01;
export const STREAK_XP_BONUS_CAP = 0.5;

// Returns the multiplier (≥1.0) to apply to the session's base XP. A 7-day
// streak returns 1.07; a 200-day streak returns 1.5 (capped).
export function streakXpMultiplier(streak: number): number {
  if (streak <= 0) return 1;
  const raw = streak * STREAK_XP_BONUS_PER_DAY;
  return 1 + Math.min(raw, STREAK_XP_BONUS_CAP);
}

// Level curve: tweakable. level = floor(sqrt(xp / 50)) + 1
//   xp 0     -> level 1
//   xp 50    -> level 2
//   xp 200   -> level 3
//   xp 450   -> level 4
//   xp 800   -> level 5
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

// Maximum number of streak freezes a user can stockpile. Caps the +1-per-
// 14-day-milestone grants so power users don't accumulate infinite saves.
// Matches the Duolingo-default that has empirically proven sticky.
export const MAX_FREEZES = 2;

// Streak milestone (in days) at which a new freeze is granted. Two weeks is
// long enough that a freeze feels earned, short enough that the user sees
// the reward repeatedly inside a typical study cycle.
export const FREEZE_GRANT_INTERVAL = 14;

export interface NextStreakResult {
  // The user's streak count after this session.
  streak: number;
  // Updated freeze stockpile after any consume/grant in this evaluation.
  freezes_remaining: number;
  // True iff a freeze was consumed in this call (i.e. the user had a 1-day
  // gap and freezes_remaining > 0). The lesson finale uses this to show a
  // "Streak saved by a freeze!" banner.
  freeze_consumed: boolean;
  // True iff this evaluation crossed a FREEZE_GRANT_INTERVAL milestone AND
  // the user wasn't already at MAX_FREEZES. The finale uses this to show a
  // "+1 streak freeze!" banner.
  freeze_granted: boolean;
}

// Streak progression with optional freeze consumption + grant.
// Rules:
//   diffDays === 0          → already active today, no change to streak.
//                              Freezes are NEITHER consumed NOR granted on
//                              same-day repeat sessions to avoid double-
//                              dipping milestones inside a single day.
//   diffDays === 1          → consecutive day: streak += 1. Grant a freeze
//                              if the NEW streak crosses a 14-day boundary.
//   diffDays === 2 AND freeze available
//                          → consume one freeze, treat as if no gap:
//                              streak += 1. No grant on this path even if
//                              the resulting streak hits a milestone - we
//                              don't want freezes to immediately self-
//                              replenish on use.
//   diffDays >= 2 (no freeze available)
//                          → streak resets to 1. Freezes are NOT touched
//                              (the user keeps their stockpile across resets
//                              - losing accumulated saves alongside the
//                              streak would feel like a double punishment).
//   No prior activity       → start at 1, no freeze movement.
//
// Single-day-gap-only coverage is intentional. Stacking freezes to cover
// arbitrary gaps would defeat the purpose; a user who misses three days
// hasn't been consistent and the reset is the right behaviour.
export function nextStreak(
  current_streak: number,
  last_active_date: Date | null,
  today: Date,
  freezes_remaining: number = 0
): NextStreakResult {
  // First-ever session: no streak, no freeze movement.
  if (!last_active_date) {
    return {
      streak: 1,
      freezes_remaining,
      freeze_consumed: false,
      freeze_granted: false,
    };
  }

  const diffDays = daysBetween(
    toUtcDateOnly(last_active_date),
    toUtcDateOnly(today)
  );

  if (diffDays === 0) {
    return {
      streak: current_streak,
      freezes_remaining,
      freeze_consumed: false,
      freeze_granted: false,
    };
  }

  if (diffDays === 1) {
    const newStreak = current_streak + 1;
    const crossedMilestone =
      newStreak > 0 && newStreak % FREEZE_GRANT_INTERVAL === 0;
    const canGrant = crossedMilestone && freezes_remaining < MAX_FREEZES;
    return {
      streak: newStreak,
      freezes_remaining: canGrant
        ? freezes_remaining + 1
        : freezes_remaining,
      freeze_consumed: false,
      freeze_granted: canGrant,
    };
  }

  // diffDays >= 2: try to save with a freeze (only covers a single-day gap).
  if (diffDays === 2 && freezes_remaining > 0) {
    return {
      streak: current_streak + 1,
      freezes_remaining: freezes_remaining - 1,
      freeze_consumed: true,
      freeze_granted: false,
    };
  }

  // Reset path. Freezes stay on the account.
  return {
    streak: 1,
    freezes_remaining,
    freeze_consumed: false,
    freeze_granted: false,
  };
}

// ---- date helpers (UTC-day-granularity) ----

export function addDays(d: Date, days: number): Date {
  const out = new Date(d.getTime());
  out.setUTCDate(out.getUTCDate() + days);
  return toUtcDateOnly(out);
}

export function toUtcDateOnly(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

export function daysBetween(a: Date, b: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}
