import { Injectable } from '@nestjs/common';
import { ProgressRepository } from './progress.repository';
import { pickLocalized, type Lang } from '../content/content.types';

// Bands shared with the frontend. Keep them here as the single source of truth;
// the frontend can use the same numbers in CSS classes without re-deriving them.
//   not_started — no state rows OR avg_mastery is null
//   weak        — 1..39
//   learning    — 40..69
//   strong      — 70..100
export type MasteryBand = 'not_started' | 'weak' | 'learning' | 'strong';

export function bandFor(avg: number | null): MasteryBand {
  if (avg === null || avg === undefined) return 'not_started';
  if (avg < 40) return 'weak';
  if (avg < 70) return 'learning';
  return 'strong';
}

export interface ProgressHeatMapLo {
  lo_id: string;
  lo_code: string;
  lo_title: string;
  total_questions: number;
  seen_questions: number;
  avg_mastery: number | null;
  band: MasteryBand;
}

export interface ProgressHeatMapPaper {
  paper_id: string;
  paper_code: string;
  paper_name: string;
  los: ProgressHeatMapLo[];
}

export interface ProgressWeakTopic {
  lo_id: string;
  lo_code: string;
  lo_title: string;
  paper_code: string;
  avg_mastery: number;
  seen_questions: number;
}

export interface ProgressRecentSession {
  id: string;
  started_at: string;
  completed_at: string | null;
  question_count: number;
  correct_count: number;
}

export interface ProgressResponse {
  heat_map: ProgressHeatMapPaper[];
  weak_topics: ProgressWeakTopic[];
  recent_sessions: ProgressRecentSession[];
}

@Injectable()
export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

  async getForUser(user_id: string, lang: Lang): Promise<ProgressResponse> {
    const [rows, weak, sessions] = await Promise.all([
      this.repo.heatMap(user_id),
      this.repo.weakTopics(user_id, 5),
      this.repo.recentSessions(user_id, 5),
    ]);

    // Group by paper, preserving the SQL order (paper.code, sort_order, lo.code).
    const byPaper = new Map<string, ProgressHeatMapPaper>();
    for (const r of rows) {
      let p = byPaper.get(r.paper_id);
      if (!p) {
        p = {
          paper_id: r.paper_id,
          paper_code: r.paper_code,
          paper_name: pickLocalized(r.paper_name_en, r.paper_name_ru, lang),
          los: [],
        };
        byPaper.set(r.paper_id, p);
      }
      p.los.push({
        lo_id: r.lo_id,
        lo_code: r.lo_code,
        lo_title: pickLocalized(r.lo_title_en, r.lo_title_ru, lang),
        total_questions: r.total_questions,
        seen_questions: r.seen_questions,
        avg_mastery: r.avg_mastery,
        band: bandFor(r.avg_mastery),
      });
    }

    return {
      heat_map: Array.from(byPaper.values()),
      weak_topics: weak.map((w) => ({
        lo_id: w.lo_id,
        lo_code: w.lo_code,
        lo_title: pickLocalized(w.lo_title_en, w.lo_title_ru, lang),
        paper_code: w.paper_code,
        avg_mastery: w.avg_mastery,
        seen_questions: w.seen_questions,
      })),
      recent_sessions: sessions.map((s) => ({
        id: s.id,
        started_at: s.started_at.toISOString(),
        completed_at: s.completed_at ? s.completed_at.toISOString() : null,
        question_count: s.question_count,
        correct_count: s.correct_count,
      })),
    };
  }
}
