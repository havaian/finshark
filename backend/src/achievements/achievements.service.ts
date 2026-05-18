import { Injectable, Logger } from "@nestjs/common";
import { AchievementsRepository } from "./achievements.repository";
import {
  AchievementMetricsRepository,
  METRICS_BY_CODE,
  type AchievementMetrics,
} from "./achievements.rules";
import {
  toPublicAchievement,
  toPublicEarnedAchievement,
  type AchievementRow,
  type Lang,
  type PublicAchievement,
  type PublicEarnedAchievement,
  type UserAchievementProgressRow,
} from "./achievements.types";

// Result of one evaluation pass — what (if anything) the user just unlocked.
// The caller (LessonsService.complete) can use this to toast "Level 2 in
// Lessons completed!" if we ever wire that into the lesson-finale UI.
export interface AchievementUnlock {
  code: string;
  new_level: number;
  threshold: number;
}

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    private readonly achievements: AchievementsRepository,
    private readonly metricsRepo: AchievementMetricsRepository
  ) {}

  // Called after a lesson session OR mock completes — same hook point as
  // BadgesService.evaluateAfterSession. Iterates the full catalog, recomputes
  // current_value from the metric snapshot, derives current_level, and upserts
  // the progress row. Returns any levels freshly crossed in this pass so the
  // caller can surface them in the response.
  //
  // Failure mode: any error is swallowed and an empty array is returned —
  // we never want an achievement bug to break lesson completion. Mirrors
  // how BadgesService handles failures.
  async evaluateAfterSession(user_id: string): Promise<AchievementUnlock[]> {
    try {
      const [catalog, progressMap, metrics] = await Promise.all([
        this.achievements.listAll(),
        this.achievements.findProgressByUser(user_id),
        this.metricsRepo.build(user_id),
      ]);

      const unlocks: AchievementUnlock[] = [];
      const nowIso = new Date().toISOString();

      for (const row of catalog) {
        const metricKey = METRICS_BY_CODE[row.code];
        if (!metricKey) {
          // Catalog row without a metric mapping — log once. This means the
          // seed introduced a code that nobody hooked into rules.ts. We skip
          // it (don't insert a zero-progress row that would never advance).
          this.logger.warn(
            `achievement '${row.code}' has no METRICS_BY_CODE entry; skipping`
          );
          continue;
        }
        const newValue = (metrics as AchievementMetrics)[metricKey];

        // Compute the highest level satisfied by newValue. We iterate the
        // levels array (already small — 3 entries) and pick the max where
        // threshold <= newValue.
        const sortedLevels = [...row.levels].sort((a, b) => a.level - b.level);
        let newLevel = 0;
        for (const lv of sortedLevels) {
          if (newValue >= lv.threshold) newLevel = lv.level;
          else break;
        }

        const prev = progressMap.get(row.code);
        const prevLevel = prev?.current_level ?? 0;
        const prevUnlocks = prev?.unlocked_at_per_level ?? {};

        // Stamp any newly-unlocked levels with NOW. We do this additively —
        // previously-unlocked levels keep their original timestamp even if
        // current_level somehow dropped (which can happen if an admin reseed
        // wipes XP/streak; in that case we want to remember the user DID
        // earn it at some point). The semantics for current_level itself
        // follow the new value, not the historical max — so the UI shows
        // their CURRENT progression, not "max ever".
        const nextUnlocks: Record<string, string> = { ...prevUnlocks };
        for (let lvl = prevLevel + 1; lvl <= newLevel; lvl++) {
          if (!nextUnlocks[String(lvl)]) {
            nextUnlocks[String(lvl)] = nowIso;
          }
          unlocks.push({
            code: row.code,
            new_level: lvl,
            threshold:
              sortedLevels.find((l) => l.level === lvl)?.threshold ?? 0,
          });
        }

        // Optimisation: skip the DB write entirely if nothing changed AND we
        // already have a row. A new user with zero metrics would otherwise
        // get a row inserted per achievement on every lesson — cheap, but
        // pointless.
        if (
          prev &&
          prev.current_value === newValue &&
          prev.current_level === newLevel
        ) {
          continue;
        }

        await this.achievements.upsertProgress({
          user_id,
          achievement_code: row.code,
          current_value: newValue,
          current_level: newLevel,
          unlocked_at_per_level: nextUnlocks,
        });
      }

      return unlocks;
    } catch (err) {
      this.logger.error(
        `achievement evaluation failed for user ${user_id}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      return [];
    }
  }

  // Public read for /me/achievements. Always returns the full catalog so the
  // UI can render locked tiles too (motivates by showing what's achievable).
  async getForUser(user_id: string, lang: Lang): Promise<PublicAchievement[]> {
    const [catalog, progressMap] = await Promise.all([
      this.achievements.listAll(),
      this.achievements.findProgressByUser(user_id),
    ]);
    return catalog.map((row) =>
      toPublicAchievement(row, progressMap.get(row.code) ?? null, lang)
    );
  }

  // Earned-only payload for someone else's public profile. Filters to
  // current_level >= 1. Order matches the catalog's sort_order so the
  // viewer sees them in the same order as the owner's profile.
  async getEarnedForUser(
    user_id: string,
    lang: Lang
  ): Promise<PublicEarnedAchievement[]> {
    const [catalog, progressMap] = await Promise.all([
      this.achievements.listAll(),
      this.achievements.findProgressByUser(user_id),
    ]);
    const out: PublicEarnedAchievement[] = [];
    for (const row of catalog) {
      const earned = toPublicEarnedAchievement(
        row,
        progressMap.get(row.code) ?? null,
        lang
      );
      if (earned) out.push(earned);
    }
    return out;
  }

  // Helper for tests / debug: not exposed via API.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _typingGuard(
    _r: AchievementRow,
    _p: UserAchievementProgressRow
  ): void {
    // no-op
  }
}
