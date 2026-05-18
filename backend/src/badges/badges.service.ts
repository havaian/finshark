import { Injectable, Logger } from '@nestjs/common';
import { BadgesRepository } from './badges.repository';
import { BadgeContextRepository, RULES } from './badges.rules';
import { toPublicBadge, type Lang, type PublicBadge } from './badges.types';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    private readonly badges: BadgesRepository,
    private readonly ctxRepo: BadgeContextRepository,
  ) {}

  // Called after a lesson session completes (and any other moment a state
  // change might trigger an earn — e.g. a mock, future). Iterates every rule
  // against the user's current snapshot, inserts new earns idempotently, and
  // returns the catalog codes that were freshly earned this call. The caller
  // includes those codes in the response so the frontend can toast.
  //
  // Failure mode: if context build or any insert throws, we log and return [].
  // We never want a badge bug to break lesson completion — XP/streak progress
  // is more important than the badge sugar.
  async evaluateAfterSession(user_id: string): Promise<string[]> {
    try {
      const ctx = await this.ctxRepo.build(user_id);
      const earnedMap = await this.badges.findEarnedByUser(user_id);
      const newlyEarned: string[] = [];

      for (const [code, rule] of Object.entries(RULES)) {
        if (earnedMap.has(code)) continue; // already had it
        if (!rule(ctx)) continue;
        const inserted = await this.badges.insertEarnIfNew(user_id, code);
        if (inserted) newlyEarned.push(code);
      }
      return newlyEarned;
    } catch (err) {
      this.logger.error(
        `badge evaluation failed for user ${user_id}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }

  // Profile page payload. Returns the full catalog with earned status per
  // badge so the UI can render unearned-but-visible greyed-out tiles.
  async getForUser(user_id: string, lang: Lang): Promise<PublicBadge[]> {
    const [catalog, earnedMap] = await Promise.all([
      this.badges.listAll(),
      this.badges.findEarnedByUser(user_id),
    ]);
    return catalog.map((row) =>
      toPublicBadge(row, earnedMap.get(row.code) ?? null, lang),
    );
  }
}
