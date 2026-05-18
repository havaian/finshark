// Shared types and helpers for the email whitelist.

export interface WhitelistRow {
  id: string;
  pattern: string;        // already lowercased
  note: string | null;
  created_at: Date;
  created_by_user_id: string | null;
}

// Public shape returned to the admin UI. Dates as ISO date strings.
export interface PublicWhitelistEntry {
  id: string;
  pattern: string;
  note: string | null;
  created_at: string;
  created_by_user_id: string | null;
  // True for entries beginning with '@' (i.e. domain patterns). The UI uses
  // this to render a different chip/badge so admins can quickly tell apart
  // exact-email entries from domain-wide allow rules.
  is_domain: boolean;
}

export function toPublicWhitelistEntry(r: WhitelistRow): PublicWhitelistEntry {
  return {
    id: String(r.id),
    pattern: r.pattern,
    note: r.note,
    created_at: r.created_at instanceof Date
      ? r.created_at.toISOString()
      : String(r.created_at),
    created_by_user_id: r.created_by_user_id !== null ? String(r.created_by_user_id) : null,
    is_domain: r.pattern.startsWith('@'),
  };
}

// Loose RFC-compatible validators. We don't try to be exhaustive — Google has
// already verified the email by the time we call isAllowed, so the shape check
// here is just to prevent obviously broken admin input from landing in DB.
const EMAIL_RE  = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const DOMAIN_RE = /^@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

// Recognised pattern shapes:
//   '@example.com'       — any email under that domain
//   'user@example.com'   — exact email
// Anything else is rejected.
export function classifyPattern(raw: string): 'email' | 'domain' | null {
  const s = raw.trim().toLowerCase();
  if (DOMAIN_RE.test(s)) return 'domain';
  if (EMAIL_RE.test(s))  return 'email';
  return null;
}

// Normalise to the canonical lowercased form. Returns null if the pattern is
// invalid.
export function normalisePattern(raw: string): string | null {
  const kind = classifyPattern(raw);
  if (!kind) return null;
  return raw.trim().toLowerCase();
}

// Does this email match the whitelist set?
// Matching is case-insensitive (we lowercase the email and assume patterns are
// already lowercased by the DB constraint chk_pattern_lowercased).
//
// A match counts when:
//   - the email exactly equals an 'email' pattern, OR
//   - the email's domain (everything from '@' onwards) equals a 'domain' pattern.
export function isEmailAllowed(email: string, patterns: string[]): boolean {
  const e = email.trim().toLowerCase();
  const atIdx = e.lastIndexOf('@');
  if (atIdx === -1) return false;
  const domainPart = e.slice(atIdx); // includes the '@'
  for (const p of patterns) {
    if (p === e) return true;
    if (p === domainPart) return true;
  }
  return false;
}
