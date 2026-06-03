// Seed runner.
// Usage: npm run db:seed
//
// Loads F1 and F5 seed data and inserts them into the database. Idempotent
// at the paper level: if a paper with the given code already exists, the
// entire paper (and its LOs/questions) is skipped - we don't try to merge
// changes into an existing paper since that risks duplicating questions on
// re-runs. To re-seed, delete the paper row manually first; cascading FKs
// take its LOs and questions with it.
//
// Exit codes:
//   0 - success (one or more papers seeded, or all already present)
//   1 - DB connection or insert error

import "dotenv/config";
import postgres from "postgres";
import { F1_PAPER } from "./data/f1";
import { F2_PAPER } from "./data/f2";
import { F3_PAPER } from "./data/f3";
import { BADGES } from "./data/badges";
import { ACHIEVEMENTS } from "./data/achievements";
import type { SeedPaper, SeedQuestion } from "./data/types";

// PAPERS array
const PAPERS: SeedPaper[] = [F1_PAPER, F2_PAPER, F3_PAPER];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1 });

  try {
    // ── Badges catalog ─────────────────────────────────────────────────
    // Upsert by code: changes to copy/icon/sort_order are picked up on every
    // run. Never rename a code - it's the FK target in user_badges.
    for (const b of BADGES) {
      await sql`
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
    console.log(`[upsert] ${BADGES.length} badge catalog entries`);

    // ── Achievements catalog ───────────────────────────────────────────
    // Same upsert-by-code pattern as badges, plus the `levels` jsonb column.
    // Never rename a code - it's the FK target in user_achievement_progress
    // and the key in METRICS_BY_CODE in src/achievements/achievements.rules.ts.
    for (const a of ACHIEVEMENTS) {
      const levelsJson = sql.json(a.levels as unknown as postgres.JSONValue);
      await sql`
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
    console.log(`[upsert] ${ACHIEVEMENTS.length} achievement catalog entries`);

    for (const paper of PAPERS) {
      // Check if this paper code already exists. If so, skip the whole paper.
      const existing = await sql<Array<{ id: string }>>`
        SELECT id FROM papers WHERE code = ${paper.code} LIMIT 1
      `;
      if (existing.length > 0) {
        console.log(`[skip] paper ${paper.code} already exists`);
        continue;
      }

      console.log(`[insert] paper ${paper.code} (${paper.name_en})`);
      await sql.begin(async (tx) => {
        // NOTE: papers and learning_objectives tables don't have is_active -
        // only questions do. Don't add it here unless you've also added a
        // migration introducing the column.
        const paperRows = await tx<Array<{ id: string }>>`
          INSERT INTO papers (code, name_en, name_ru)
          VALUES (${paper.code}, ${paper.name_en}, ${paper.name_ru})
          RETURNING id
        `;
        const paperId = paperRows[0].id;

        for (const lo of paper.learning_objectives) {
          const loRows = await tx<Array<{ id: string }>>`
            INSERT INTO learning_objectives (
              paper_id, code,
              title_en, title_ru,
              description_en, description_ru,
              theory_en, theory_ru,
              sort_order
            )
            VALUES (
              ${paperId}, ${lo.code},
              ${lo.title_en}, ${lo.title_ru},
              ${lo.description_en}, ${lo.description_ru},
              ${lo.theory_en ?? null}, ${lo.theory_ru ?? null},
              ${lo.sort_order}
            )
            RETURNING id
          `;
          const loId = loRows[0].id;

          for (const q of lo.questions) {
            await insertQuestion(tx, loId, q);
          }
          console.log(`  +LO ${lo.code} (${lo.questions.length} questions)`);
        }
      });
    }
    console.log("seed: done");
  } catch (err) {
    console.error("seed: failed", err);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

// Insert a single question into the given LO using the active tx handle.
// Discriminates on q.type to populate the right shape per type:
//   - mcq: options JSONB + correct option key in correct_answer_en
//   - number_entry: numeric value (string) in correct_answer_en, optional tolerance
// (short_answer is retired - see Grading Spec - and no longer a seed type.)
async function insertQuestion(
  tx: postgres.TransactionSql,
  lo_id: string,
  q: SeedQuestion
): Promise<void> {
  if (q.type === "mcq") {
    // Belt-and-braces: scrub why_wrong from the correct option so storage
    // invariant holds even if the seed author forgot.
    const cleanedOptions = q.options.map((o) => {
      if (o.key === q.correct_answer_en) {
        // Strip why_wrong on correct option.
        const { why_wrong_en, why_wrong_ru, ...rest } = o;
        void why_wrong_en;
        void why_wrong_ru;
        return { ...rest, why_wrong_en: null, why_wrong_ru: null };
      }
      return {
        ...o,
        why_wrong_en: o.why_wrong_en ?? null,
        why_wrong_ru: o.why_wrong_ru ?? null,
      };
    });
    const optionsJson = tx.json(
      cleanedOptions as unknown as postgres.JSONValue
    );
    await tx`
      INSERT INTO questions (
        lo_id, type, difficulty,
        prompt_en, prompt_ru,
        options,
        correct_answer_en, correct_answer_ru,
        explanation_en, explanation_ru,
        concept_bite_en, concept_bite_ru,
        acceptable_tolerance,
        is_active
      ) VALUES (
        ${lo_id}, ${q.type}, ${q.difficulty},
        ${q.prompt_en}, ${q.prompt_ru},
        ${optionsJson},
        ${q.correct_answer_en}, ${null},
        ${q.explanation_en}, ${q.explanation_ru},
        ${q.concept_bite_en ?? null}, ${q.concept_bite_ru ?? null},
        ${null},
        TRUE
      )
    `;
  } else {
    // number_entry. No options; correct_answer_ru is null (numbers are
    // language-neutral); tolerance flows through if provided.
    await tx`
      INSERT INTO questions (
        lo_id, type, difficulty,
        prompt_en, prompt_ru,
        options,
        correct_answer_en, correct_answer_ru,
        explanation_en, explanation_ru,
        concept_bite_en, concept_bite_ru,
        acceptable_tolerance,
        is_active
      ) VALUES (
        ${lo_id}, ${q.type}, ${q.difficulty},
        ${q.prompt_en}, ${q.prompt_ru},
        ${null},
        ${q.correct_answer_en}, ${null},
        ${q.explanation_en}, ${q.explanation_ru},
        ${q.concept_bite_en ?? null}, ${q.concept_bite_ru ?? null},
        ${q.acceptable_tolerance ?? null},
        TRUE
      )
    `;
  }
}

main();
