import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";

// At-a-glance counts for the admin landing page. Each metric is a single
// aggregate — the whole response is one SQL roundtrip via multiple
// subqueries. We keep it scoped to "things the admin checks first": total
// users, active premium, recent signups, recent activity, content counts.
//
// Mounted under /api/admin/overview. Separate from /admin/users so the
// landing page can hit ONE endpoint instead of stitching together half a
// dozen list calls.

interface OverviewResponse {
  users: {
    total: number;
    admins: number;
    // Users with email_reminders_enabled — we use this as a proxy for the
    // "engaged" cohort.
    reminders_enabled: number;
    // New signups in the last 7 days.
    new_last_7d: number;
  };
  premium: {
    // Active subscription rows. A user with multiple active subs counts once.
    active: number;
    // Active premium users (distinct user_id from active subs).
    active_users: number;
  };
  activity: {
    // Lesson sessions (mode='lesson') completed in the last 7 days.
    lessons_last_7d: number;
    // Mock sessions completed in the last 7 days.
    mocks_last_7d: number;
    // Distinct users who completed at least one session in the last 24h.
    active_users_last_24h: number;
  };
  content: {
    papers: number;
    learning_objectives: number;
    questions_active: number;
    questions_inactive: number;
  };
}

@Controller("admin/overview")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminOverviewController {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  @Get()
  async overview(): Promise<OverviewResponse> {
    // Each subquery is independent so the planner can parallelise. We
    // explicitly cast to int — postgres COUNT(*) is bigint and would
    // otherwise be returned as string by postgres.js.
    type Row = {
      users_total: number;
      users_admins: number;
      users_reminders_enabled: number;
      users_new_last_7d: number;
      premium_active: number;
      premium_active_users: number;
      lessons_last_7d: number;
      mocks_last_7d: number;
      active_users_last_24h: number;
      papers: number;
      learning_objectives: number;
      questions_active: number;
      questions_inactive: number;
    };

    const rows = await this.sql<Row[]>`
      SELECT
        (SELECT COUNT(*)::int FROM users)                              AS users_total,
        (SELECT COUNT(*)::int FROM users WHERE is_admin = TRUE)        AS users_admins,
        (SELECT COUNT(*)::int FROM users WHERE email_reminders_enabled = TRUE)
                                                                       AS users_reminders_enabled,
        (SELECT COUNT(*)::int FROM users WHERE created_at >= NOW() - INTERVAL '7 days')
                                                                       AS users_new_last_7d,

        (SELECT COUNT(*)::int FROM subscriptions WHERE status = 'active')
                                                                       AS premium_active,
        (SELECT COUNT(DISTINCT user_id)::int FROM subscriptions WHERE status = 'active')
                                                                       AS premium_active_users,

        (SELECT COUNT(*)::int FROM lesson_sessions
         WHERE mode = 'lesson' AND completed_at >= NOW() - INTERVAL '7 days')
                                                                       AS lessons_last_7d,
        (SELECT COUNT(*)::int FROM lesson_sessions
         WHERE mode = 'mock' AND completed_at >= NOW() - INTERVAL '7 days')
                                                                       AS mocks_last_7d,
        (SELECT COUNT(DISTINCT user_id)::int FROM lesson_sessions
         WHERE completed_at >= NOW() - INTERVAL '24 hours')
                                                                       AS active_users_last_24h,

        (SELECT COUNT(*)::int FROM papers)                             AS papers,
        (SELECT COUNT(*)::int FROM learning_objectives)                AS learning_objectives,
        (SELECT COUNT(*)::int FROM questions WHERE is_active = TRUE)   AS questions_active,
        (SELECT COUNT(*)::int FROM questions WHERE is_active = FALSE)  AS questions_inactive
    `;
    const r = rows[0];
    return {
      users: {
        total: r.users_total,
        admins: r.users_admins,
        reminders_enabled: r.users_reminders_enabled,
        new_last_7d: r.users_new_last_7d,
      },
      premium: {
        active: r.premium_active,
        active_users: r.premium_active_users,
      },
      activity: {
        lessons_last_7d: r.lessons_last_7d,
        mocks_last_7d: r.mocks_last_7d,
        active_users_last_24h: r.active_users_last_24h,
      },
      content: {
        papers: r.papers,
        learning_objectives: r.learning_objectives,
        questions_active: r.questions_active,
        questions_inactive: r.questions_inactive,
      },
    };
  }
}
