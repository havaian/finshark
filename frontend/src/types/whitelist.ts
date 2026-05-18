// Mirrors backend/src/whitelist/whitelist.types.ts PublicWhitelistEntry.
export interface WhitelistEntry {
  id: string;
  pattern: string;        // already lowercased; either "user@example.com" or "@example.com"
  note: string | null;
  created_at: string;     // ISO timestamp
  created_by_user_id: string | null;
  // True for domain patterns ('@example.com'); false for exact emails.
  is_domain: boolean;
}
