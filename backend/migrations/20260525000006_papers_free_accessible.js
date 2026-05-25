// papers.free_accessible — whether a paper is browsable/playable on the free
// tier. Default TRUE so the migration is non-disruptive: every existing paper
// stays open until an admin flips the flag. Gates on the app side branch on
// (entitlement.tier === 'premium' || paper.free_accessible).
//
// Why a per-paper boolean instead of a paper allow-list table: the cardinality
// of papers is tiny (a few dozen ACCA papers, ever), and the only attribute
// we currently care about is the single boolean. A new column on papers stays
// in sync with paper inserts automatically, no separate seed/maintenance.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('papers', {
    free_accessible: { type: 'boolean', notNull: true, default: true },
  });
  // Cheap covering index for the "list of free-accessible papers" admin lookup.
  // Postgres handles single-column index on a boolean column poorly only when
  // the distribution is skewed enough to make a seq scan cheaper — for ~30
  // rows this is irrelevant either way, but kept for symmetry with the rest
  // of the schema and to telegraph intent.
  pgm.createIndex('papers', 'free_accessible', { name: 'idx_papers_free_accessible' });
};

exports.down = (pgm) => {
  pgm.dropIndex('papers', 'free_accessible', { name: 'idx_papers_free_accessible' });
  pgm.dropColumns('papers', ['free_accessible']);
};
