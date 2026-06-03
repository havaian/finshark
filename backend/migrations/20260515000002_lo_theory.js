// Per-LO long-form theory ("Kaplan-style bite", 150-300 words). Surfaces as a
// pre-lesson primer and is the foundation for a future read-only study mode
// where users browse theory independently of question queues.
//
// Both columns are NULLABLE - existing LOs have no theory yet; we don't want
// to gate seeding on writing 150-300 words per LO upfront. The lesson UI shows
// the primer only when theory_en is non-null (i.e. opt-in per LO).
//
// _en is the canonical form; _ru is optional and falls back to _en at the
// lang resolver level (same convention as other content fields).

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('learning_objectives', {
    theory_en: { type: 'text' },
    theory_ru: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('learning_objectives', ['theory_en', 'theory_ru']);
};
