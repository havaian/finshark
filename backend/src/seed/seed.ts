// Seed runner.
// Usage: npm run db:seed
//
// Loads F1 and F5 seed data and inserts them into the database. Idempotent
// at the paper level: if a paper with the given code already exists, the
// entire paper (and its LOs/questions) is skipped — we don't try to merge
// changes into an existing paper since that risks duplicating questions on
// re-runs. To re-seed, delete the paper row manually first; cascading FKs
// take its LOs and questions with it.
//
// Exit codes:
//   0 — success (one or more papers seeded, or all already present)
//   1 — DB connection or insert error

import 'dotenv/config';
import postgres from 'postgres';
import { F1_PAPER } from './data/f1';
import { F5_PAPER } from './data/f5';
import type { SeedPaper, SeedQuestion } from './data/types';

const PAPERS: SeedPaper[] = [F1_PAPER, F5_PAPER];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const sql = postgres(url, { max: 1 });

  try {
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
        const paperRows = await tx<Array<{ id: string }>>`
          INSERT INTO papers (code, name_en, name_ru, is_active)
          VALUES (${paper.code}, ${paper.name_en}, ${paper.name_ru}, TRUE)
          RETURNING id
        `;
        const paperId = paperRows[0].id;

        for (const lo of paper.learning_objectives) {
          const loRows = await tx<Array<{ id: string }>>`
            INSERT INTO learning_objectives (
              paper_id, code, title_en, title_ru, description_en, description_ru, sort_order, is_active
            )
            VALUES (
              ${paperId}, ${lo.code}, ${lo.title_en}, ${lo.title_ru},
              ${lo.description_en}, ${lo.description_ru}, ${lo.sort_order}, TRUE
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
    console.log('seed: done');
  } catch (err) {
    console.error('seed: failed', err);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

// Insert a single question into the given LO using the active tx handle.
// Discriminates on q.type to populate MCQ-specific (options + correct option key)
// vs short_answer-specific (canonical text per language) fields.
async function insertQuestion(
  tx: postgres.TransactionSql,
  lo_id: string,
  q: SeedQuestion,
): Promise<void> {
  if (q.type === 'mcq') {
    // MCQ options must be persisted as a JSONB array. correct_answer_en is
    // the option key (e.g. 'A'); correct_answer_ru is unused for MCQ so we
    // store NULL — the lang resolver falls back to the EN value (the key).
    const optionsJson = tx.json(q.options as unknown as postgres.JSONValue);
    await tx`
      INSERT INTO questions (
        lo_id, type, difficulty,
        prompt_en, prompt_ru,
        options,
        correct_answer_en, correct_answer_ru,
        explanation_en, explanation_ru,
        concept_bite_en, concept_bite_ru,
        is_active
      ) VALUES (
        ${lo_id}, ${q.type}, ${q.difficulty},
        ${q.prompt_en}, ${q.prompt_ru},
        ${optionsJson},
        ${q.correct_answer_en}, ${null},
        ${q.explanation_en}, ${q.explanation_ru},
        ${q.concept_bite_en ?? null}, ${q.concept_bite_ru ?? null},
        TRUE
      )
    `;
  } else {
    await tx`
      INSERT INTO questions (
        lo_id, type, difficulty,
        prompt_en, prompt_ru,
        options,
        correct_answer_en, correct_answer_ru,
        explanation_en, explanation_ru,
        concept_bite_en, concept_bite_ru,
        is_active
      ) VALUES (
        ${lo_id}, ${q.type}, ${q.difficulty},
        ${q.prompt_en}, ${q.prompt_ru},
        ${null},
        ${q.correct_answer_en}, ${q.correct_answer_ru},
        ${q.explanation_en}, ${q.explanation_ru},
        ${q.concept_bite_en ?? null}, ${q.concept_bite_ru ?? null},
        TRUE
      )
    `;
  }
}

main();
