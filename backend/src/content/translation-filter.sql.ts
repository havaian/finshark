import type { Sql } from "postgres";
import type { Lang } from "./content.types";

// SQL counterpart of isQuestionTranslated() in content.types.ts.
//
// Product rule B3: a question is only served to a non-English user when every
// user-visible string on it exists in that language. Partially-translated
// questions are hidden rather than patched with English.
//
// This has to exist in SQL as well as TypeScript because the lesson queue and
// mock sampler pick questions with LIMIT - filtering after hydration would
// return short lessons ("you asked for 10, here are 4") instead of picking 10
// eligible ones. The TS predicate stays the authority for single-row checks
// (fixed-mock playback, admin views); the two MUST be kept in step.
//
// Excluded from the check, matching the TS version:
//   - why_wrong / concept_bite : optional authoring extras, frequently absent
//     even in English. Requiring them would hide most of the bank.
//   - correct_answer           : canonical / language-neutral for every live type.
//
// Returns an empty fragment for EN (canonical - always present, NOT NULL).

// Whitelist of the non-canonical languages. Both the suffix and the alias are
// spliced into raw SQL, so neither may ever come from user input: `lang` is
// already narrowed to the Lang union by the @Lang decorator, and every call
// site passes a hardcoded alias literal.
const NON_CANONICAL: Record<string, string> = { ru: "ru", uz: "uz" };

// btrim(...) <> '' rather than IS NOT NULL throughout: an empty-string
// translation is an untranslated row that an importer or an admin clearing a
// field happened to write as '', and it would render as a blank question.
function predicate(alias: string, L: string): string {
  // jsonb_array_elements() on a NULL column errors, so every jsonb source is
  // wrapped in COALESCE(..., '[]'::jsonb). The CASE means the mcq branch never
  // runs for a matching question and vice versa, but the COALESCE keeps it
  // safe even for a malformed row.
  const optionsOk = `
        NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(COALESCE(${alias}.options, '[]'::jsonb)) opt
          WHERE COALESCE(btrim(opt->>'text_${L}'), '') = ''
        )
        AND jsonb_array_length(COALESCE(${alias}.options, '[]'::jsonb)) > 0`;

  // Labels must exist AND align 1:1 with the canonical set - a short array
  // would put the wrong choice under a statement.
  const trueFalseOk = `
        jsonb_typeof(${alias}.payload->'labels_${L}') = 'array'
        AND jsonb_array_length(${alias}.payload->'labels_${L}')
            = jsonb_array_length(${alias}.payload->'labels')
        AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(
            COALESCE(${alias}.payload->'labels_${L}', '[]'::jsonb)
          ) lbl
          WHERE COALESCE(btrim(lbl), '') = ''
        )
        AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(
            COALESCE(${alias}.payload->'statements', '[]'::jsonb)
          ) st
          WHERE COALESCE(btrim(st->>'text_${L}'), '') = ''
        )`;

  const matchingOk = `
        NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(
            COALESCE(${alias}.payload->'rows', '[]'::jsonb)
          ) r
          WHERE COALESCE(btrim(r->>'label_${L}'), '') = ''
        )
        AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(
            COALESCE(${alias}.payload->'options', '[]'::jsonb)
          ) o
          WHERE COALESCE(btrim(o->>'value_${L}'), '') = ''
        )`;

  return `
    COALESCE(btrim(${alias}.prompt_${L}), '') <> ''
    AND COALESCE(btrim(${alias}.explanation_${L}), '') <> ''
    AND (
      COALESCE(btrim(${alias}.exhibit_en), '') = ''
      OR COALESCE(btrim(${alias}.exhibit_${L}), '') <> ''
    )
    AND (
      CASE ${alias}.type::text
        WHEN 'mcq'        THEN (${optionsOk}
        )
        WHEN 'mcq_multi'  THEN (${optionsOk}
        )
        WHEN 'true_false' THEN (${trueFalseOk}
        )
        WHEN 'matching'   THEN (${matchingOk}
        )
        ELSE TRUE
      END
    )`;
}

// Build the `AND <question is fully translated in lang>` fragment for a query
// that has `questions` joined under the given alias (default "q"). Interpolate
// it directly into the WHERE clause of a postgres.js template query.
export function andTranslatedIn(sql: Sql, lang: Lang, alias = "q") {
  const L = NON_CANONICAL[lang];
  if (!L) return sql``; // en (or anything unrecognised): no restriction
  return sql`AND (${sql.unsafe(predicate(alias, L))})`;
}

// The inverse, for "does this mock contain ANY untranslated question" style
// EXISTS subqueries. Returns a fragment that is never true for EN (`FALSE`),
// so an EN caller sees no rows excluded.
export function andNotTranslatedIn(sql: Sql, lang: Lang, alias = "q") {
  const L = NON_CANONICAL[lang];
  if (!L) return sql`AND FALSE`;
  return sql`AND NOT (${sql.unsafe(predicate(alias, L))})`;
}
