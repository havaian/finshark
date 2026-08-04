/* eslint-disable camelcase */

// Allow a subscription period to be zero-length.
//
// WHY
//
// Grants chain: buying a second month while the first is still running creates
// a row whose starts_at is in the FUTURE. Revoking such a row set
// ends_at = NOW(), which lands before starts_at and tripped
// chk_subs_ends_after_starts - so revoking a chained purchase failed outright
// with a 500, and the bulk revoke aborted its whole transaction.
//
// The correct end for a grant that never took effect is starts_at itself: an
// empty window. That requires ends_at >= starts_at rather than a strict
// inequality.
//
// This does NOT weaken anything meaningful. ends_at < starts_at is still
// rejected, which is the actual nonsense case. And entitlement keys off
// status, not dates - a revoked row is status='expired' and grants nothing
// regardless of how its window reads.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropConstraint('subscriptions', 'chk_subs_ends_after_starts');
  pgm.addConstraint('subscriptions', 'chk_subs_ends_after_starts', {
    check: 'ends_at IS NULL OR ends_at >= starts_at',
  });
};

exports.down = (pgm) => {
  // Reverting is only safe once any zero-length rows are gone - the strict
  // constraint would reject them. Collapse them into the past first so the
  // old check can be re-applied without failing validation.
  pgm.sql(`
    UPDATE subscriptions
    SET starts_at = ends_at - INTERVAL '1 second'
    WHERE ends_at IS NOT NULL AND ends_at = starts_at
  `);
  pgm.dropConstraint('subscriptions', 'chk_subs_ends_after_starts');
  pgm.addConstraint('subscriptions', 'chk_subs_ends_after_starts', {
    check: 'ends_at IS NULL OR ends_at > starts_at',
  });
};
