import { Injectable, NotFoundException } from "@nestjs/common";
import { UsersRepository } from "../users/users.repository";
import type { UserRow, BgLevel } from "../users/user.types";
import { toPublicUser } from "../users/user.types";
import type { CompleteOnboardingDto } from "./dto/complete-onboarding.dto";

// Onboarding orchestration. Owns the derivation rules from background level
// + time budget to initial preference values. Once onboarded, the lesson
// algorithm only sees preferred_difficulty + lesson_size — bg_level itself
// is never read again.

// Approximate seconds per question used to derive lesson_size from
// time_budget_minutes. We pick the middle of MCQ (~20s) and number_entry
// (~60s) — averages out around 40s. The result is clamped to the DB range
// 3..10 so the user can't accidentally end up with a 30-question lesson.
const SECS_PER_QUESTION = 40;

// Map background level to a default preferred_difficulty. Beginners default
// to 'easy' (mostly easy questions with the occasional medium). Advanced
// default to NULL → the auto heuristic, which mostly serves medium/hard.
// Intermediate explicitly NULL too so they get the full mix.
function defaultDifficultyFor(
  bg: BgLevel | null
): "easy" | "medium" | "hard" | null {
  if (bg === "beginner") return "easy";
  // intermediate and advanced both get NULL = auto/full mix.
  return null;
}

// Derive lesson_size from a time budget. The intent: a 15-minute slot →
// ~22 questions raw, clamped to 10 (the DB max). A 5-minute slot → ~7 →
// clamped to 7. We bias slightly toward the lower bound to leave room for
// the theory primer screen and feedback animations that eat real time.
function deriveLessonSize(time_budget_minutes: number): number {
  const raw = Math.round((time_budget_minutes * 60) / SECS_PER_QUESTION);
  // DB constraint: 3..10
  return Math.max(3, Math.min(10, raw));
}

@Injectable()
export class OnboardingService {
  constructor(private readonly users: UsersRepository) {}

  // GET /onboarding/status — used by frontend guard. Returns whether the user
  // still needs to onboard plus the current values (so a re-onboarding flow
  // could pre-fill them, though we don't expose that UI yet).
  async getStatus(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException("user not found");
    return {
      onboarded: user.onboarded_at !== null,
      onboarded_at: user.onboarded_at ? user.onboarded_at.toISOString() : null,
      // Echo current values so the frontend can pre-fill if user re-visits.
      bg_level: user.bg_level,
      time_budget_minutes: user.time_budget_minutes,
      preferred_paper_id: user.preferred_paper_id,
    };
  }

  // POST /onboarding/complete — accepts partial or empty body. Empty body =
  // skip path (just stamps onboarded_at = NOW()).
  async complete(userId: string, dto: CompleteOnboardingDto) {
    // Build the patch for the repo. We always derive lesson_size if
    // time_budget is set, and always derive preferred_difficulty if bg_level
    // is set. Both derivations are deterministic so a user who re-runs
    // onboarding with the same answers gets the same preferences.
    const patch: Parameters<UsersRepository["applyOnboarding"]>[1] = {};

    if (dto.bg_level !== undefined) {
      patch.bg_level = dto.bg_level;
      // Only set preferred_difficulty from bg_level if the user hasn't already
      // explicitly set it somewhere else. We don't have that info here cheaply,
      // so we always overwrite during onboarding — this is the user's first
      // chance to express a preference, so claiming priority is fine. After
      // onboarding the Settings page can override it.
      patch.preferred_difficulty = defaultDifficultyFor(dto.bg_level);
    }

    if (dto.time_budget_minutes !== undefined) {
      patch.time_budget_minutes = dto.time_budget_minutes;
      patch.lesson_size = deriveLessonSize(dto.time_budget_minutes);
    }

    if (dto.preferred_paper_id !== undefined) {
      patch.preferred_paper_id = dto.preferred_paper_id;
    }

    // applyOnboarding always sets onboarded_at = NOW(), even for an empty patch.
    const updatedCore = await this.users.applyOnboarding(userId, patch);
    if (!updatedCore) throw new NotFoundException("user not found");

    // Handle email reminders separately if provided — that lives on its own
    // dedicated setter to keep the existing preferences API consistent.
    let updated = updatedCore;
    if (dto.email_reminders_enabled !== undefined) {
      const r = await this.users.setEmailReminders(
        userId,
        dto.email_reminders_enabled
      );
      if (r) updated = r;
    }

    return toPublicUser(updated);
  }
}
