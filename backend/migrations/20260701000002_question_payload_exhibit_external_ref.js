// New objective question types - STAGE 2 of 2 (columns + constraint).
//
// Pairs with 20260701000001 (which added the enum values). Adds the storage
// each new type needs and rewrites the type/options CHECK to cover all five
// types. Additive only: every existing row (mcq / number_entry) stays valid.
//
// COLUMNS ADDED to questions:
//   - payload (jsonb, nullable): the structured body for true_false and
//     matching questions. mcq / mcq_multi keep using the existing `options`
//     column; number_entry uses neither. Inner shape is validated at the app
//     layer (content.types) - the DB only checks "is a JSON object" via the
//     constraint below. Shapes:
//       true_false: { labels: string[], labels_ru: string[]|null,
//                     statements: [{ text_en, text_ru, answer }] }
//       matching:   { rows: [{ label_en, label_ru, correct_value_en }],
//                     options: [{ value_en, value_ru }] }
//   - exhibit_en / exhibit_ru (text, nullable): the data/scenario block shown
//     alongside a question (a trial balance, figures, an accounts extract).
//     Rendered as its own panel above the prompt. NULL for questions with no
//     exhibit. _ru falls back to _en in clients, same pattern as prompt.
//   - external_ref (text, nullable): the stable source reference for a
//     question (e.g. "F1-M1-Q01" from the mock workbook). Used by the bank
//     importer to upsert - re-importing the sheet updates the matching row
//     instead of creating a duplicate. NULL for hand-authored / seeded rows.
//     A partial UNIQUE index enforces one row per non-null ref; the many
//     existing NULL-ref rows are unconstrained.
//
// CONSTRAINT: chk_question_type_options is replaced by chk_question_type_shape,
//   which pins the (options, payload) shape per type:
//     mcq          -> options array,   payload null
//     mcq_multi    -> options array,   payload null   (same storage as mcq;
//                     correct_answer_en holds the sorted keys, e.g. "B,C")
//     number_entry -> options null,    payload null
//     true_false   -> options null,    payload object
//     matching     -> options null,    payload object
//   Comparisons use type::text (not enum literals) because the enum values
//   added in stage 1 are not yet committed when this runs in the same
//   `migrate:up` batch - the exact rule that forced the number_entry split.
//
// DOWN: drop the index, restore the mcq + number_entry constraint, drop the
//   four columns. The extra enum values remain (see stage 1) but are then
//   unreferenced, matching the schema state before this pair.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('questions', {
    // Structured body for true_false / matching. NULL for other types.
    payload: { type: 'jsonb' },
    // Data/scenario panel shown above the prompt. NULL when absent.
    exhibit_en: { type: 'text' },
    exhibit_ru: { type: 'text' },
    // Stable source reference used by the bank importer for idempotent upsert.
    external_ref: { type: 'text' },
  });

  // Swap the options-only constraint for one that also governs payload and
  // covers all five types. type::text comparisons keep this safe in the same
  // batch as the stage-1 ADD VALUE (see header).
  pgm.dropConstraint('questions', 'chk_question_type_options');
  pgm.addConstraint('questions', 'chk_question_type_shape', {
    check: `
      (type::text = 'mcq'          AND options IS NOT NULL AND jsonb_typeof(options) = 'array' AND payload IS NULL)
      OR
      (type::text = 'mcq_multi'    AND options IS NOT NULL AND jsonb_typeof(options) = 'array' AND payload IS NULL)
      OR
      (type::text = 'number_entry' AND options IS NULL AND payload IS NULL)
      OR
      (type::text = 'true_false'   AND options IS NULL AND payload IS NOT NULL AND jsonb_typeof(payload) = 'object')
      OR
      (type::text = 'matching'     AND options IS NULL AND payload IS NOT NULL AND jsonb_typeof(payload) = 'object')
    `,
  });

  // One question per non-null external_ref. Multiple NULLs allowed (all the
  // pre-existing hand-authored/seeded rows), so this is a PARTIAL unique index.
  pgm.createIndex('questions', 'external_ref', {
    name: 'uq_questions_external_ref',
    unique: true,
    where: 'external_ref IS NOT NULL',
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('questions', 'external_ref', { name: 'uq_questions_external_ref' });

  // Restore the prior constraint shape (post-20260524000003): mcq + number_entry.
  pgm.dropConstraint('questions', 'chk_question_type_shape');
  pgm.addConstraint('questions', 'chk_question_type_options', {
    check: `
      (type::text = 'mcq'          AND options IS NOT NULL AND jsonb_typeof(options) = 'array')
      OR
      (type::text = 'number_entry' AND options IS NULL)
    `,
  });

  pgm.dropColumns('questions', ['payload', 'exhibit_en', 'exhibit_ru', 'external_ref']);
};
