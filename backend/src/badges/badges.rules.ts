import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';

// Snapshot of user-level facts the rules need. Built ONCE per evaluation call
// so we don't fan out into multiple queries per rule. Adding a new badge rule:
//   1) Pull whatever extra column you need into this context.
//   2) Add the rule predicate below.
//   3) Add a catalog entry in src/seed/data/badges.ts.
//   4) Wire the rule into RULES below, keyed by the catalog `code`.
export interface BadgeContext {
  xp: number;
  streak_count: number;
  // Distinct paper codes the user has answered at least one question in.
  // Computed via attempts → questions → learning_objectives → papers.
  distinct_papers_studied: number;
  // LOs with mastery_score >= 90 in user_question_state, taking the highest
  // mastery_score per LO. Counted at LO granularity, not per question.
  lo_mastered_count: number;
  // Has the user completed at least one session? Cheap derived flag — true
  // when we have any attempt rows for them.
  has_any_attempt: boolean;
}

@Injectable()
export class BadgeContextRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // One query that returns all aggregates we need. We use subqueries rather
  // than a giant JOIN because the LO-mastery aggregation needs its own GROUP BY
  // and Postgres tolerates this style fine. All subqueries default to 0 / FALSE
  // for users with no data via COALESCE / EXISTS.
  async build(user_id: string): Promise<BadgeContext> {
    const rows = await this.sql<Array<{
      xp: number;
      streak_count: number;
      distinct_papers_studied: number;
      lo_mastered_count: number;
      has_any_attempt: boolean;
    }>>`
      SELECT
        u.xp                                                            AS xp,
        u.streak_count                                                  AS streak_count,
        (
          SELECT COUNT(DISTINCT lo.paper_id)::int
          FROM attempts a
          JOIN questions q  ON q.id  = a.question_id
          JOIN learning_objectives lo ON lo.id = q.lo_id
          WHERE a.user_id = u.id
        )                                                               AS distinct_papers_studied,
        (
          SELECT COUNT(DISTINCT uqs.lo_id)::int
          FROM user_question_state uqs
          WHERE uqs.user_id = u.id
            AND uqs.mastery_score >= 90
        )                                                               AS lo_mastered_count,
        EXISTS (SELECT 1 FROM attempts a WHERE a.user_id = u.id)        AS has_any_attempt
      FROM users u
      WHERE u.id = ${user_id}
    `;

    const r = rows[0];
    if (!r) {
      // User vanished mid-call. Return a zero context so callers behave sanely.
      return {
        xp: 0,
        streak_count: 0,
        distinct_papers_studied: 0,
        lo_mastered_count: 0,
        has_any_attempt: false,
      };
    }
    return r;
  }
}

// Rule predicates. Keep these pure (context-only) so they're trivially testable
// and the evaluator can run them all in any order against a single snapshot.
type Rule = (ctx: BadgeContext) => boolean;

// Keys MUST match catalog codes in src/seed/data/badges.ts. A missing rule for
// a catalog code means that badge is unearnable; a rule for a code that isn't
// in the catalog will fail the FK at insert time. The sanity check at module
// init time logs a warning if these drift.
export const RULES: Record<string, Rule> = {
  // Streak family
  streak_7:   (c) => c.streak_count >= 7,
  streak_30:  (c) => c.streak_count >= 30,
  streak_100: (c) => c.streak_count >= 100,

  // XP family
  xp_500:   (c) => c.xp >= 500,
  xp_2500:  (c) => c.xp >= 2500,
  xp_10000: (c) => c.xp >= 10000,

  // Paper exploration
  paper_started:  (c) => c.has_any_attempt,
  paper_explorer: (c) => c.distinct_papers_studied >= 3,

  // Mastery
  lo_mastered_1:  (c) => c.lo_mastered_count >= 1,
  lo_mastered_10: (c) => c.lo_mastered_count >= 10,
};
