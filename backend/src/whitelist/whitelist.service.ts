import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WhitelistRepository } from "./whitelist.repository";
import {
  classifyPattern,
  isEmailAllowed,
  normalisePattern,
  toPublicWhitelistEntry,
  type PublicWhitelistEntry,
} from "./whitelist.types";

@Injectable()
export class WhitelistService implements OnModuleInit {
  private readonly log = new Logger(WhitelistService.name);

  // Closed sign-up was for the pre-launch period. It is OFF by default now:
  // an unset variable means anyone with a verified Google account can register.
  //
  // The gate is disabled rather than deleted because the admin page, the table
  // and the patterns are all still here and still correct - flipping this to
  // "true" restores closed sign-up without a migration or a deploy of new code.
  //
  // Anything other than the exact string "true" leaves sign-up open, so a typo
  // fails towards letting users in rather than silently locking everyone out.
  private readonly enforced: boolean;

  constructor(
    private readonly repo: WhitelistRepository,
    config: ConfigService
  ) {
    this.enforced =
      (config.get<string>("WHITELIST_ENABLED") ?? "false").toLowerCase() ===
      "true";
  }

  onModuleInit(): void {
    // Logged at startup because "why can nobody sign up" and "why can everybody
    // sign up" are both questions best answered by one line in the boot log.
    this.log.log(
      this.enforced
        ? "whitelist ENFORCED - only listed emails/domains may sign in"
        : "whitelist OFF - sign-up is open to any verified Google account"
    );
  }

  get isEnforced(): boolean {
    return this.enforced;
  }

  // Auth-time check. True when the email matches any whitelist entry.
  //
  // We fetch the pattern list on every call. Number of patterns is small
  // (admins manage a handful manually) so a per-login query is fine; if we
  // ever scale into hundreds we can put a short in-memory TTL cache here.
  async isEmailAllowed(email: string): Promise<boolean> {
    // Gate disabled: allow everyone, and skip the query entirely.
    if (!this.enforced) return true;

    const patterns = await this.repo.findAllPatterns();
    // Empty whitelist → DENY ALL. This is the safer default once whitelist
    // enforcement ships; the migration backfills existing users so an empty
    // table really does mean "nobody allowed yet".
    if (patterns.length === 0) return false;
    return isEmailAllowed(email, patterns);
  }

  async list(): Promise<PublicWhitelistEntry[]> {
    const rows = await this.repo.findAll();
    return rows.map(toPublicWhitelistEntry);
  }

  // Admin: add a pattern. Validates shape (exact email or '@domain'),
  // normalises (trim + lowercase), then inserts. 409 if already exists.
  async add(input: {
    pattern: string;
    note: string | null;
    created_by_user_id: string | null;
  }): Promise<PublicWhitelistEntry> {
    const normalised = normalisePattern(input.pattern);
    if (!normalised) {
      throw new BadRequestException(
        "pattern must be an email (user@example.com) or domain (@example.com)"
      );
    }
    const noteClean = input.note?.trim() || null;
    if (noteClean && noteClean.length > 500) {
      throw new BadRequestException("note is too long (max 500 chars)");
    }

    const inserted = await this.repo.insert({
      pattern: normalised,
      note: noteClean,
      created_by_user_id: input.created_by_user_id,
    });
    if (!inserted) {
      throw new ConflictException(
        `pattern "${normalised}" is already in the whitelist`
      );
    }
    return toPublicWhitelistEntry(inserted);
  }

  // Admin: update note. Pattern itself stays immutable (delete+re-add to
  // change it - that way audit trail (created_at, created_by_user_id) is
  // accurate, and we don't accidentally widen scope under the same id).
  async updateNote(
    id: string,
    note: string | null
  ): Promise<PublicWhitelistEntry> {
    const noteClean = note?.trim() || null;
    if (noteClean && noteClean.length > 500) {
      throw new BadRequestException("note is too long (max 500 chars)");
    }
    const updated = await this.repo.updateNote(id, noteClean);
    if (!updated) throw new NotFoundException("whitelist entry not found");
    return toPublicWhitelistEntry(updated);
  }

  async remove(id: string): Promise<void> {
    const ok = await this.repo.deleteById(id);
    if (!ok) throw new NotFoundException("whitelist entry not found");
  }

  // Convenience for the auth flow: log + classify what the admin would see.
  // Currently used only via the public API; kept here so the auth service
  // doesn't reach across into the repo.
  classifyPattern = classifyPattern;
}
