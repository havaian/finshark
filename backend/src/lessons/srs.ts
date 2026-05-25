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
    // next day, which felt repetitive for users — getting an easy question
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

// XP per correct answer. Wrong = 0 unless this is the user's FIRST encounter
// with the question — see XP_PER_FIRST_WRONG.
export const XP_PER_CORRECT = 10;

// Partial-credit XP awarded the FIRST time a user sees a question and gets it
// wrong. Rationale: the most learning-dense moment in the loop is the one
// where the user is engaging with a brand-new question, attempting it, and
// then reading the explanation. Awarding nothing there created a perverse
// gradient ("guessing is safer than trying hard"). 2 XP is small enough that
// it can't be farmed (each question is first-seen once) but large enough that
// the user notices the +2 pill on the feedback card.
//
// Repeat wrongs award 0 — the user has already been credited for their first
// honest attempt; subsequent wrongs on the same question are a mastery signal,
// not a learning event, and the SRS interval handles them.
export const XP_PER_FIRST_WRONG = 2;

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
//                              the resulting streak hits a milestone — we
//                              don't want freezes to immediately self-
//                              replenish on use.
//   diffDays >= 2 (no freeze available)
//                          → streak resets to 1. Freezes are NOT touched
//                              (the user keeps their stockpile across resets
//                              — losing accumulated saves alongside the
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
