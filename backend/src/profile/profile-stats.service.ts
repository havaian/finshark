import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ProfileStatsRepository } from "./profile-stats.repository";
import { pickLocalized, type Lang } from "../content/content.types";

const ACTIVITY_DAYS = 365; // year-long heatmap (Github-style)
const MASTERY_HISTORY_DAYS = 90; // 3 months of daily snapshots

export interface ProfileStatsResponse {
  overall: {
    total_sessions_completed: number;
    total_questions_answered: number;
    total_correct: number;
    accuracy_pct: number | null; // null when no attempts
  };
  accuracy_by_paper: Array<{
    paper_id: string;
    paper_code: string;
    paper_name: string;
    attempts: number;
    correct: number;
    accuracy_pct: number;
  }>;
  difficulty_breakdown: Array<{
    difficulty: "easy" | "medium" | "hard";
    attempts: number;
    correct: number;
  }>;
  type_breakdown: Array<{
    type: "mcq" | "number_entry";
    attempts: number;
    correct: number;
  }>;
  activity_heatmap: Array<{
    day: string; // 'YYYY-MM-DD'
    attempts_count: number;
  }>;
  mastery_history: Array<{
    snap_date: string; // 'YYYY-MM-DD'
    avg_mastery: number;
  }>;
}

@Injectable()
export class ProfileStatsService {
  private readonly log = new Logger(ProfileStatsService.name);

  constructor(private readonly repo: ProfileStatsRepository) {}

  async getForUser(user_id: string, lang: Lang): Promise<ProfileStatsResponse> {
    const [overall, byPaper, diff, type, activity, mastery] = await Promise.all(
      [
        this.repo.overall(user_id),
        this.repo.accuracyByPaper(user_id),
        this.repo.difficultyBreakdown(user_id),
        this.repo.typeBreakdown(user_id),
        this.repo.activityHeatmap(user_id, ACTIVITY_DAYS),
        this.repo.masteryHistory(user_id, MASTERY_HISTORY_DAYS),
      ]
    );

    const accuracy_pct =
      overall.total_questions_answered === 0
        ? null
        : (overall.total_correct / overall.total_questions_answered) * 100;

    return {
      overall: {
        total_sessions_completed: overall.total_sessions_completed,
        total_questions_answered: overall.total_questions_answered,
        total_correct: overall.total_correct,
        accuracy_pct,
      },
      accuracy_by_paper: byPaper.map((r) => ({
        paper_id: r.paper_id,
        paper_code: r.paper_code,
        paper_name: pickLocalized(
          r.paper_name_en,
          r.paper_name_ru,
          r.paper_name_uz,
          lang
        ),
        attempts: r.attempts,
        correct: r.correct,
        accuracy_pct: r.attempts === 0 ? 0 : (r.correct / r.attempts) * 100,
      })),
      difficulty_breakdown: diff.map((r) => ({
        difficulty: r.difficulty,
        attempts: r.attempts,
        correct: r.correct,
      })),
      type_breakdown: type.map((r) => ({
        type: r.type,
        attempts: r.attempts,
        correct: r.correct,
      })),
      activity_heatmap: activity.map((r) => ({
        // Cast to ISO date-only string. Postgres date type comes back as JS Date
        // at midnight UTC.
        day: r.day.toISOString().slice(0, 10),
        attempts_count: r.attempts_count,
      })),
      mastery_history: mastery.map((r) => ({
        snap_date: r.snap_date.toISOString().slice(0, 10),
        avg_mastery: r.avg_mastery,
      })),
    };
  }

  // Daily cron: rebuild today's mastery snapshot per user.
  // Runs every day at 00:30 UTC. Idempotent - re-running just refreshes today's value.
  // If this fires multiple times within a day (manual trigger after a deploy),
  // the row for today is overwritten with the current average, which is the desired behaviour.
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: "mastery-snapshots" })
  async snapshotJob(): Promise<void> {
    try {
      const n = await this.repo.writeTodaysSnapshots();
      this.log.log(`wrote mastery snapshots for ${n} users`);
    } catch (e) {
      this.log.error(`mastery snapshot job failed: ${(e as Error).message}`);
    }
  }
}
