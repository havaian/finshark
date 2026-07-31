import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Sql } from "postgres";
import postgres from "postgres";
import { PG } from "../db/db.module";
import { F1_PAPER } from "./data/f1";
import { F2_PAPER } from "./data/f2";
import { F3_PAPER } from "./data/f3";
import { FA2_PAPER } from "./data/fa2";
import { BADGES } from "./data/badges";
import { ACHIEVEMENTS } from "./data/achievements";
import type { SeedPaper, SeedQuestion } from "./data/types";
import { ACCA_APPLIED_KNOWLEDGE_STRUCTURE } from "../content/content.types";

// Source-of-truth for which papers ship in the seed. Kept here so both the
// CLI script (seed.ts) and the admin "drop & reseed" button hit the same data.
// F5 exists in /seed/data/f5.ts but is intentionally NOT included - its content
// is incomplete. Uncomment + import once it's finalised.
export const SEED_PAPERS: SeedPaper[] = [
  F1_PAPER,
  F2_PAPER,
  F3_PAPER,
  FA2_PAPER,
];

export interface ReseedResult {
  papers_dropped: number;
  papers_inserted: number;
  badges_upserted: number;
  achievements_upserted: number;
  questions_inserted: number;
  // Auxiliary content rows wiped alongside papers (the cascade does most of
  // the work; we count things explicitly so the admin UI can show what
  // happened - useful when staring at a "reseed succeeded" toast).
  attempts_deleted: number;
  sessions_deleted: number;
  uqs_deleted: number;
  user_badges_deleted: number;
  user_achievement_progress_deleted: number;
  mastery_snapshots_deleted: number;
  users_progress_reset: number;
}

// Encapsulates the seed flow so both the CLI runner and admin controllers can
// trigger it. Two entry points:
//   - seedIdempotent(): the original CLI behaviour - skip papers that already
//     exist; upsert the badges catalog.
//   - dropAndReseedContent(): wipe ALL content and progress (except the users
//     rows themselves) and reseed from scratch. Used by the admin button.
//
// Both call the same insert helpers so any seed-shape change applies to both.
@Injectable()
export class SeedService {
  private readonly log = new Logger(SeedService.name);

  constructor(@Inject(PG) private readonly sql: Sql) {}

  // ── Public: idempotent seed (CLI default) ──────────────────────────
  // Upserts the badges catalog and inserts any paper whose code does NOT yet
  // exist. Existing papers are left alone - merging into an in-place paper
  // would risk duplicating questions.
  async seedIdempotent(): Promise<void> {
    await this.upsertBadges(this.sql);
    await this.upsertAchievements(this.sql);

    for (const paper of SEED_PAPERS) {
      const existing = await this.sql<Array<{ id: string }>>`
        SELECT id FROM papers WHERE code = ${paper.code} LIMIT 1
      `;
      if (existing.length > 0) {
        this.log.log(`[skip] paper ${paper.code} already exists`);
        continue;
      }

      this.log.log(`[insert] paper ${paper.code} (${paper.name_en})`);
      await this.sql.begin(async (tx) => {
        await this.insertPaperWithChildren(tx, paper);
      });
    }
  }

  // ── Public: drop content + progress, then reseed from scratch ─────────
  //
  // Wipes everything related to content and user progress but keeps the
  // `users` rows themselves alive (only progress columns are zeroed). Also
  // keeps:
  //   - refresh_tokens (active sessions stay alive - user keeps being logged in)
  //   - badges catalog (it's a static catalog)
  //   - ui_translations
  //
  // FK order matters: `attempts.question_id` is ON DELETE RESTRICT, and so is
  // `lesson_session_questions.question_id`. So we must delete those rows
  // BEFORE we delete papers (which cascades into questions). Mocks live as
  // `lesson_sessions` rows with mode='mock' - wiping lesson_sessions covers them.
  async dropAndReseedContent(): Promise<ReseedResult> {
    return this.sql.begin(async (tx) => {
      // Count what we're about to wipe so the result is informative. We do
      // counts BEFORE the deletes because cascaded deletes don't surface in
      // the rowCount of the trigger DELETE.
      const beforeAttempts = await tx<
        Array<{ c: string }>
      >`SELECT COUNT(*)::text AS c FROM attempts`;
      const beforeSessions = await tx<
        Array<{ c: string }>
      >`SELECT COUNT(*)::text AS c FROM lesson_sessions`;
      const beforeUqs = await tx<
        Array<{ c: string }>
      >`SELECT COUNT(*)::text AS c FROM user_question_state`;
      const beforePapers = await tx<
        Array<{ c: string }>
      >`SELECT COUNT(*)::text AS c FROM papers`;
      const beforeUserBadges = await tx<
        Array<{ c: string }>
      >`SELECT COUNT(*)::text AS c FROM user_badges`;
      const beforeUserAchProgress = await tx<
        Array<{ c: string }>
      >`SELECT COUNT(*)::text AS c FROM user_achievement_progress`;
      const beforeMasterySnapshots = await tx<
        Array<{ c: string }>
      >`SELECT COUNT(*)::text AS c FROM mastery_snapshots`;
      const usersCount = await tx<
        Array<{ c: string }>
      >`SELECT COUNT(*)::text AS c FROM users`;

      // ── Wipe progress / content ──────────────────────────────────
      // Order chosen so we never violate ON DELETE RESTRICT on questions.
      //
      // 1) lesson_session_questions: FK to questions (RESTRICT) - must go
      //    before questions/papers. (Cascades from lesson_sessions too but
      //    we delete it explicitly so the count is accurate.)
      await tx`DELETE FROM lesson_session_questions`;
      // 2) attempts: FK to questions (RESTRICT) - same reason.
      await tx`DELETE FROM attempts`;
      // 3) Now safe to drop lesson_sessions (FK to papers is SET NULL, FK to
      //    users is CASCADE - but we keep users, so the row goes by itself).
      await tx`DELETE FROM lesson_sessions`;
      // 4) user_question_state: FK to questions CASCADE, but deleting it
      //    explicitly is cheaper than reading + cascading every row.
      await tx`DELETE FROM user_question_state`;
      // 5) mastery_snapshots: standalone history; clear so the chart matches
      //    the wiped progress.
      await tx`DELETE FROM mastery_snapshots`;
      // 6) user_badges: earned events are progress - wipe. (badges catalog
      //    stays.)
      await tx`DELETE FROM user_badges`;
      // 6b) user_achievement_progress: per-user progress - wipe. (achievements
      //     catalog stays. user_id is CASCADE from users; we delete explicitly
      //     anyway so the count is correct and decoupled from user deletion.)
      await tx`DELETE FROM user_achievement_progress`;
      // 7) llm_grade_cache: per-question cache; useless without the questions.
      await tx`DELETE FROM llm_grade_cache`;
      // 8) reminder_emails_sent: per-user history of reminders. Not strictly
      //    progress but tied to lessons; clear to avoid weird gaps.
      await tx`DELETE FROM reminder_emails_sent`;
      // 8b) mock_exam_questions: FK to questions is RESTRICT, so this MUST go
      //     before papers (dropping a paper cascades into its questions, which a
      //     still-referencing mock_exam_questions row would block). Harmless
      //     no-op on a DB with no imported mocks.
      await tx`DELETE FROM mock_exam_questions`;
      // 8c) mock_exams: cascades from papers anyway, but delete explicitly for a
      //     clean, ordered wipe now that its children are gone.
      await tx`DELETE FROM mock_exams`;
      // 9) Finally drop papers - cascades into learning_objectives and
      //    questions automatically.
      await tx`DELETE FROM papers`;

      // ── Reset progress columns on users ──────────────────────────
      // We keep the users rows but zero out streak/xp/level/last_active_date
      // so the dashboard reflects the wipe. Defaults match the migration:
      // streak_count=0, xp=0, level=1, last_active_date=NULL.
      await tx`
        UPDATE users
        SET streak_count = 0,
            xp = 0,
            level = 1,
            last_active_date = NULL
      `;

      // ── Reseed papers + badges + achievements ────────────────────
      const badgesCount = await this.upsertBadges(tx);
      const achievementsCount = await this.upsertAchievements(tx);
      let papersInserted = 0;
      let questionsInserted = 0;
      for (const paper of SEED_PAPERS) {
        this.log.log(`[reseed insert] paper ${paper.code}`);
        const qCount = await this.insertPaperWithChildren(tx, paper);
        papersInserted += 1;
        questionsInserted += qCount;
      }

      return {
        papers_dropped: parseInt(beforePapers[0]?.c ?? "0", 10),
        papers_inserted: papersInserted,
        badges_upserted: badgesCount,
        achievements_upserted: achievementsCount,
        questions_inserted: questionsInserted,
        attempts_deleted: parseInt(beforeAttempts[0]?.c ?? "0", 10),
        sessions_deleted: parseInt(beforeSessions[0]?.c ?? "0", 10),
        uqs_deleted: parseInt(beforeUqs[0]?.c ?? "0", 10),
        user_badges_deleted: parseInt(beforeUserBadges[0]?.c ?? "0", 10),
        user_achievement_progress_deleted: parseInt(
          beforeUserAchProgress[0]?.c ?? "0",
          10
        ),
        mastery_snapshots_deleted: parseInt(
          beforeMasterySnapshots[0]?.c ?? "0",
          10
        ),
        users_progress_reset: parseInt(usersCount[0]?.c ?? "0", 10),
      };
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  // Upsert the static badges catalog. Returns the row count so callers can
  // include it in their summary. Accepts the root sql or a transaction handle
  // - postgres.js's TransactionSql is structurally compatible with Sql for
  // tagged-template usage.
  private async upsertBadges(
    handle: Sql | postgres.TransactionSql
  ): Promise<number> {
    for (const b of BADGES) {
      await handle`
        INSERT INTO badges (code, name_en, name_ru, description_en, description_ru, icon, sort_order)
        VALUES (${b.code}, ${b.name_en}, ${b.name_ru}, ${b.description_en}, ${b.description_ru}, ${b.icon}, ${b.sort_order})
        ON CONFLICT (code) DO UPDATE
          SET name_en = EXCLUDED.name_en,
              name_ru = EXCLUDED.name_ru,
              description_en = EXCLUDED.description_en,
              description_ru = EXCLUDED.description_ru,
              icon = EXCLUDED.icon,
              sort_order = EXCLUDED.sort_order
      `;
    }
    return BADGES.length;
  }

  // Upsert the static achievements catalog. Same pattern as upsertBadges but
  // also handles the `levels` jsonb column. Never rename a code - it's the
  // FK target in user_achievement_progress and the key in METRICS_BY_CODE.
  private async upsertAchievements(
    handle: Sql | postgres.TransactionSql
  ): Promise<number> {
    for (const a of ACHIEVEMENTS) {
      const levelsJson = handle.json(a.levels as unknown as postgres.JSONValue);
      await handle`
        INSERT INTO achievements (
          code, name_en, name_ru, description_en, description_ru, icon, sort_order, levels
        )
        VALUES (
          ${a.code}, ${a.name_en}, ${a.name_ru},
          ${a.description_en}, ${a.description_ru},
          ${a.icon}, ${a.sort_order},
          ${levelsJson}
        )
        ON CONFLICT (code) DO UPDATE
          SET name_en = EXCLUDED.name_en,
              name_ru = EXCLUDED.name_ru,
              description_en = EXCLUDED.description_en,
              description_ru = EXCLUDED.description_ru,
              icon = EXCLUDED.icon,
              sort_order = EXCLUDED.sort_order,
              levels = EXCLUDED.levels
      `;
    }
    return ACHIEVEMENTS.length;
  }

  // Resolve the 'acca' program id, creating the row if it doesn't exist.
  // Idempotent via ON CONFLICT on the unique code. The migration seeds 'acca'
  // already, so in a migrated DB this is a plain lookup; the upsert covers a
  // fresh test DB seeded before/without that migration's data.
  private async ensureAccaProgram(
    handle: postgres.TransactionSql
  ): Promise<string> {
    const rows = await handle<Array<{ id: string }>>`
      INSERT INTO programs (code, name_en, name_ru, unit_noun, sort_order)
      VALUES ('acca', 'ACCA', 'ACCA', 'paper', 0)
      ON CONFLICT (code) DO UPDATE SET name_en = EXCLUDED.name_en
      RETURNING id
    `;
    return rows[0].id;
  }

  // Insert a paper + its LOs + its questions. Must be called inside a tx.
  // Returns the number of questions inserted (for the reseed summary).
  private async insertPaperWithChildren(
    tx: postgres.TransactionSql,
    paper: SeedPaper
  ): Promise<number> {
    // Every paper belongs to a program (NOT NULL) and carries an exam_structure
    // (NOT NULL). The ACCA Applied Knowledge papers use the standard structure;
    // FA2 (FIA) supplies its own (50 x 2 marks) on its SeedPaper. We resolve
    // (creating if missing) the 'acca' program - FA2 is grouped under the same
    // program for now. ensureAccaProgram is idempotent - the dropAndReseed path
    // wipes papers but NOT programs, and the migration already seeds 'acca', so
    // normally this just looks it up.
    const programId = await this.ensureAccaProgram(tx);
    const structureJson = tx.json(
      (paper.exam_structure ??
        ACCA_APPLIED_KNOWLEDGE_STRUCTURE) as unknown as postgres.JSONValue
    );

    const paperRows = await tx<Array<{ id: string }>>`
      INSERT INTO papers (code, name_en, name_ru, name_uz, program_id, exam_structure)
      VALUES (${paper.code}, ${paper.name_en}, ${paper.name_ru}, ${paper.name_uz ?? null}, ${programId}, ${structureJson})
      RETURNING id
    `;
    const paperId = paperRows[0].id;
    let questionsCount = 0;

    for (const lo of paper.learning_objectives) {
      const loRows = await tx<Array<{ id: string }>>`
        INSERT INTO learning_objectives (
          paper_id, code,
          title_en, title_ru, title_uz,
          description_en, description_ru, description_uz,
          theory_en, theory_ru, theory_uz,
          sort_order
        )
        VALUES (
          ${paperId}, ${lo.code},
          ${lo.title_en}, ${lo.title_ru}, ${lo.title_uz ?? null},
          ${lo.description_en}, ${lo.description_ru}, ${lo.description_uz ?? null},
          ${lo.theory_en ?? null}, ${lo.theory_ru ?? null}, ${lo.theory_uz ?? null},
          ${lo.sort_order}
        )
        RETURNING id
      `;
      const loId = loRows[0].id;

      // Batch-insert this LO's questions in ONE statement instead of a
      // per-question round-trip. With ~hundreds of questions per paper, the
      // old one-INSERT-per-question loop meant hundreds of sequential awaits
      // per paper; this collapses them to one INSERT per LO. We build a
      // uniform row object per question (same column set the single-row path
      // used) and hand the array to postgres.js's tx(rows, ...cols) helper,
      // which expands it into a multi-row VALUES list.
      const rows = lo.questions.map((q) => this.toQuestionRow(tx, loId, q));
      if (rows.length > 0) {
        await tx`
          INSERT INTO questions ${tx(
            rows,
            "lo_id",
            "type",
            "difficulty",
            "prompt_en",
            "prompt_ru",
            "prompt_uz",
            "options",
            "correct_answer_en",
            "correct_answer_ru",
            "correct_answer_uz",
            "explanation_en",
            "explanation_ru",
            "explanation_uz",
            "concept_bite_en",
            "concept_bite_ru",
            "concept_bite_uz",
            "acceptable_tolerance",
            "is_active"
          )}
        `;
        questionsCount += rows.length;
      }
    }
    return questionsCount;
  }

  // Normalise one SeedQuestion into the flat row object the batch INSERT
  // expects. Maps all three languages: the F1/F2/F3 seed files carry complete
  // _uz alongside _en/_ru, and until this mapping existed every one of those
  // Uzbek strings was silently dropped on insert.
  // Discriminates on type:
  //   - mcq: options JSONB (why_wrong scrubbed off the correct option),
  //          correct_answer_en holds the option key, no tolerance.
  //   - number_entry: no options, correct_answer_en holds the numeric value
  //                   string, acceptable_tolerance optional.
  // correct_answer_ru / _uz are always null (MCQ keys are language-neutral;
  // numeric values are too), matching the original behaviour.
  private toQuestionRow(
    tx: postgres.TransactionSql,
    lo_id: string,
    q: SeedQuestion
  ): Record<string, unknown> {
    if (q.type === "mcq") {
      // Belt-and-braces: scrub why_wrong from the correct option so storage
      // invariant holds even if the seed author forgot.
      const cleanedOptions = q.options.map((o) => {
        if (o.key === q.correct_answer_en) {
          // Strip why_wrong on correct option.
          const { why_wrong_en, why_wrong_ru, why_wrong_uz, ...rest } = o;
          void why_wrong_en;
          void why_wrong_ru;
          void why_wrong_uz;
          return {
            ...rest,
            text_uz: o.text_uz ?? null,
            why_wrong_en: null,
            why_wrong_ru: null,
            why_wrong_uz: null,
          };
        }
        return {
          ...o,
          text_uz: o.text_uz ?? null,
          why_wrong_en: o.why_wrong_en ?? null,
          why_wrong_ru: o.why_wrong_ru ?? null,
          why_wrong_uz: o.why_wrong_uz ?? null,
        };
      });
      return {
        lo_id,
        type: q.type,
        difficulty: q.difficulty,
        prompt_en: q.prompt_en,
        prompt_ru: q.prompt_ru,
        prompt_uz: q.prompt_uz ?? null,
        options: tx.json(cleanedOptions as unknown as postgres.JSONValue),
        correct_answer_en: q.correct_answer_en,
        correct_answer_ru: null,
        correct_answer_uz: null,
        explanation_en: q.explanation_en,
        explanation_ru: q.explanation_ru,
        explanation_uz: q.explanation_uz ?? null,
        concept_bite_en: q.concept_bite_en ?? null,
        concept_bite_ru: q.concept_bite_ru ?? null,
        concept_bite_uz: q.concept_bite_uz ?? null,
        acceptable_tolerance: null,
        is_active: true,
      };
    }
    // number_entry
    return {
      lo_id,
      type: q.type,
      difficulty: q.difficulty,
      prompt_en: q.prompt_en,
      prompt_ru: q.prompt_ru,
      prompt_uz: q.prompt_uz ?? null,
      options: null,
      correct_answer_en: q.correct_answer_en,
      correct_answer_ru: null,
      correct_answer_uz: null,
      explanation_en: q.explanation_en,
      explanation_ru: q.explanation_ru,
      explanation_uz: q.explanation_uz ?? null,
      concept_bite_en: q.concept_bite_en ?? null,
      concept_bite_ru: q.concept_bite_ru ?? null,
      concept_bite_uz: q.concept_bite_uz ?? null,
      acceptable_tolerance: q.acceptable_tolerance ?? null,
      is_active: true,
    };
  }
}
