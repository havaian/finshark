import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';
import { BadgesService } from '../badges/badges.service';
import type { Lang } from '../content/content.types';

// Public-profile response: a sanitized view of someone else's profile that
// any authenticated user can fetch. Deliberately excludes everything sensitive:
//   - email (PII)
//   - last_active_date (can be used to infer when someone is online)
//   - is_admin (no reason to surface)
//   - preferences (reminder hour, difficulty, lesson size)
//   - google_sub (internal identifier)
//
// What IS surfaced is purely the "show-off" side of the profile: identity
// (display_name + join date) and progression (XP, level, streak, accuracy,
// total lessons, earned badges). This matches what already appears on the
// leaderboard, so making it clickable doesn't leak anything new.
export interface PublicProfileResponse {
  id: string;
  display_name: string;
  level: number;
  xp: number;
  streak_count: number;
  created_at: string;             // ISO timestamp
  total_lessons: number;          // completed sessions
  accuracy_pct: number | null;    // null when zero attempts
  badges: Array<{
    code: string;
    name: string;
    description: string;
    icon: string;
    earned_at: string | null;
  }>;
}

@Injectable()
export class PublicProfileService {
  constructor(
    @Inject(PG) private readonly sql: Sql,
    private readonly badges: BadgesService,
  ) {}

  // Resolve a user by id and return the sanitized public profile.
  // Throws NotFoundException if the id doesn't match any user — we don't
  // want to silently return empty data, since "missing" and "exists but
  // hidden" should be indistinguishable for callers (here both 404).
  async getById(viewed_user_id: string, lang: Lang): Promise<PublicProfileResponse> {
    // Single-row identity + cheap aggregates inlined. We deliberately don't
    // pull from profile_stats repo: that returns more than we want, and
    // would mean re-implementing the filter in two places. Just compute the
    // two needed numbers (total_lessons, accuracy_pct) directly here.
    const idRows = await this.sql<
      Array<{
        id: string;
        display_name: string;
        level: number;
        xp: number;
        streak_count: number;
        created_at: Date;
      }>
    >`
      SELECT id, display_name, level, xp, streak_count, created_at
      FROM users
      WHERE id = ${viewed_user_id}
    `;
    if (idRows.length === 0) throw new NotFoundException('user not found');
    const u = idRows[0];

    // Completed sessions count.
    const lessonRows = await this.sql<Array<{ total: string }>>`
      SELECT COUNT(*)::text AS total
      FROM lesson_sessions
      WHERE user_id = ${viewed_user_id} AND completed_at IS NOT NULL
    `;
    const total_lessons = Number(lessonRows[0]?.total ?? 0);

    // Overall accuracy across all attempts.
    const accuracyRows = await this.sql<
      Array<{ attempts: string; correct: string }>
    >`
      SELECT
        COUNT(*)::text AS attempts,
        COUNT(*) FILTER (WHERE is_correct)::text AS correct
      FROM attempts
      WHERE user_id = ${viewed_user_id}
    `;
    const attempts = Number(accuracyRows[0]?.attempts ?? 0);
    const correct = Number(accuracyRows[0]?.correct ?? 0);
    const accuracy_pct = attempts === 0 ? null : (correct / attempts) * 100;

    // Badges — reuse the existing service, then filter to earned only since
    // unearned badges on someone else's profile is just noise. The service
    // already returns localised name/description per the lang argument.
    const allBadges = await this.badges.getForUser(viewed_user_id, lang);
    const earned = allBadges
      .filter((b) => b.earned)
      .map((b) => ({
        code: b.code,
        name: b.name,
        description: b.description,
        icon: b.icon,
        earned_at: b.earned_at,
      }));

    return {
      id: u.id,
      display_name: u.display_name,
      level: u.level,
      xp: u.xp,
      streak_count: u.streak_count,
      created_at: u.created_at.toISOString(),
      total_lessons,
      accuracy_pct,
      badges: earned,
    };
  }
}
