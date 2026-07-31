/* eslint-disable camelcase */

// Uzbek localization: add the third language column alongside every existing
// _en / _ru pair.
//
// Background: the frontend has shipped UZ end to end (i18n/uz.ts, admin editor
// fields, api types) but the backend never gained the columns, so SUPPORTED_LANGS
// stayed ["en","ru"] and every _uz field the admin UI sent was rejected by the
// global ValidationPipe. This migration closes that gap.
//
// All new columns are nullable text, mirroring the _ru columns exactly. _en
// remains the canonical NOT NULL value.
//
// JSONB-embedded translations (questions.options[].text_uz / why_wrong_uz,
// questions.payload true_false labels_uz + statements[].text_uz, matching
// rows[].label_uz + options[].value_uz) need no DDL - JSONB is schemaless and
// the application treats a missing key as "no translation". They are listed
// here only so the full localized surface is documented in one place.
//
// No backfill: content is reseeded from src/seed/data (which already carries
// complete UZ for F1/F2/F3 and UZ LO metadata for FA2), and the imported mock
// bank is re-imported from the workbook once its RU/UZ columns are filled.

exports.shorthands = undefined;

// table -> columns added. Kept as data so up/down stay symmetrical and a new
// table only needs one edit.
const UZ_COLUMNS = {
  programs: ['name_uz'],
  papers: ['name_uz'],
  learning_objectives: ['title_uz', 'description_uz', 'theory_uz'],
  questions: [
    'prompt_uz',
    'explanation_uz',
    'concept_bite_uz',
    'correct_answer_uz',
    'exhibit_uz',
  ],
  mock_exams: ['name_uz'],
  badges: ['name_uz', 'description_uz'],
  achievements: ['name_uz', 'description_uz'],
  email_templates: ['subject_uz', 'body_uz', 'html_uz'],
};

exports.up = (pgm) => {
  for (const [table, columns] of Object.entries(UZ_COLUMNS)) {
    const spec = {};
    for (const col of columns) {
      // Nullable: an absent translation is a real state, not an error. The
      // question-visibility rule (isQuestionTranslated) is enforced in the
      // application layer, not by a constraint, because "translated" depends
      // on question type and on JSONB contents a CHECK can't reach.
      spec[col] = { type: 'text' };
    }
    pgm.addColumns(table, spec);
  }
};

exports.down = (pgm) => {
  for (const [table, columns] of Object.entries(UZ_COLUMNS)) {
    pgm.dropColumns(table, columns);
  }
};
