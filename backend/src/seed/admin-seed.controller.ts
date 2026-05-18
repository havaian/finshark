import { Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { SeedService, type ReseedResult } from './seed.service';

// Admin-only endpoint that wipes content + progress and reseeds the catalog
// from the bundled seed data. Destructive — guarded by both JwtAuthGuard and
// AdminGuard so only admins can hit it, and throttled tighter than the global
// default to mitigate accidental double-clicks (the frontend also disables
// the button during the request).
//
// Mounted under /api/admin/system to leave room for future system-level
// operations (e.g. /admin/system/health).
@Controller('admin/system')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminSeedController {
  private readonly log = new Logger(AdminSeedController.name);

  constructor(private readonly seed: SeedService) {}

  // POST /api/admin/system/reseed
  // Drops all content + per-user progress (papers, LOs, questions, attempts,
  // sessions, user_question_state, mastery_snapshots, user_badges,
  // user_achievement_progress, llm cache, reminder history) and zeros
  // progress columns on users. Then inserts the bundled seed catalog from
  // scratch (papers + badges + achievements). Users themselves, refresh_tokens,
  // the badges catalog, the achievements catalog, and the locale JSON files
  // are NOT touched.
  //
  // Throttling: 3 calls per minute per IP. Reseed is a heavy operation; this
  // is a safety net on top of the disable-on-click in the UI.
  @Post('reseed')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  async reseed(): Promise<ReseedResult> {
    this.log.warn('admin reseed: dropping content + progress and reseeding');
    const result = await this.seed.dropAndReseedContent();
    this.log.warn(`admin reseed: done — ${JSON.stringify(result)}`);
    return result;
  }
}
