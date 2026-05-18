// Mirrors backend src/badges/badges.types.ts PublicBadge.
//
// `earned` is the boolean the UI uses to grey-out unearned tiles. `earned_at`
// is the ISO timestamp for the earned ones (used to sort "recently earned"
// or show a tooltip with the date).
export interface PublicBadge {
  code: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  earned: boolean;
  earned_at: string | null;
}
