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
export function applySm2(prev: SrsState, quality: number, today: Date): SrsState {
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
export function applyMastery(prev_mastery: number, was_correct: boolean): number {
  const delta = was_correct ? 10 : -20;
  const next = prev_mastery + delta;
  if (next < 0) return 0;
  if (next > 100) return 100;
  return next;
}

// XP per correct answer. Wrong = 0.
export const XP_PER_CORRECT = 10;

// Level curve: tweakable. level = floor(sqrt(xp / 50)) + 1
//   xp 0     -> level 1
//   xp 50    -> level 2
//   xp 200   -> level 3
//   xp 450   -> level 4
//   xp 800   -> level 5
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

// Streak: increment if last activity was yesterday, keep if today, otherwise reset to 1.
// Uses date-only comparison (no time component) on UTC dates.
export function nextStreak(
  current_streak: number,
  last_active_date: Date | null,
  today: Date,
): number {
  if (!last_active_date) return 1;
  const diffDays = daysBetween(toUtcDateOnly(last_active_date), toUtcDateOnly(today));
  if (diffDays === 0) return current_streak;       // already active today
  if (diffDays === 1) return current_streak + 1;   // streak continues
  return 1;                                        // broke the streak; this session restarts it
}

// ---- date helpers (UTC-day-granularity) ----

export function addDays(d: Date, days: number): Date {
  const out = new Date(d.getTime());
  out.setUTCDate(out.getUTCDate() + days);
  return toUtcDateOnly(out);
}

export function toUtcDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function daysBetween(a: Date, b: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}
