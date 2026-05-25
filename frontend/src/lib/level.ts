// Frontend mirror of the level math in backend/src/lessons/srs.ts.
// Kept in sync by convention — the backend is the source of truth for the
// stored `level` value, but the UI needs to derive the next-level threshold
// to render "X / Y XP to level N+1" without an extra round-trip.
//
// If the backend curve changes, update this file too. Tests on the backend
// already cover the math; we don't duplicate them here.

// xp 0 → level 1, xp 50 → level 2, xp 200 → level 3, etc.
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

// XP threshold to REACH `level`. Inverse of levelFromXp:
//   level 1 starts at 0, level 2 at 50, level 3 at 200, level 4 at 450…
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return (l - 1) * (l - 1) * 50;
}

// XP earned within the current level, and the size of the band to the next.
// Used to render a progress label like "120 / 150 XP".
export function levelProgress(xp: number): {
  level: number;
  intoLevel: number;
  bandSize: number;
  toNext: number;
} {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const bandSize = ceiling - floor;
  const intoLevel = xp - floor;
  return { level, intoLevel, bandSize, toNext: bandSize - intoLevel };
}
