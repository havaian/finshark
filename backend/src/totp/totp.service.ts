import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { authenticator } from "otplib";
import * as QRCode from "qrcode";
import { UsersRepository } from "../users/users.repository";
import { AuthService } from "../auth/auth.service";
import type { AuthTokens } from "../auth/auth.service";
import { toPublicUser } from "../users/user.types";
import type { PublicUser } from "../users/user.types";
import { TotpRepository } from "./totp.repository";
import type {
  TotpSetupBeginResult,
  TotpSetupVerifyResult,
  TotpStatusResult,
} from "./totp.types";

// otplib defaults: 30s step, SHA-1, 6 digits, window=0. We bump window to
// ±1 step (so 30s clock skew on the phone is forgiven). Don't bump higher —
// each extra step is one more code an attacker has a 1-in-1M shot at.
authenticator.options = { window: 1 };

// Recovery code format: 5 groups of 5 alphanumeric chars separated by dashes,
// e.g. "A4F2K-9XQ3M-PL7HJ-WR1NB-V8K2D". 25 chars × ~32 entropy bits = ~125
// bits. Plenty. We strip the dashes on input so users can paste with or
// without them.
const RECOVERY_CODE_COUNT = 10;
const RECOVERY_CODE_GROUPS = 5;
const RECOVERY_CODE_GROUP_LEN = 5;
const RECOVERY_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

// scrypt cost. N=2^14 is the Node default for `crypto.scryptSync`; bumping
// to 2^15 puts each verify around 100ms — acceptable for a code path that
// only fires during 2FA verify, not on every request.
const SCRYPT_N = 1 << 15;
const SCRYPT_KEYLEN = 32;
const SCRYPT_SALT_BYTES = 16;

// Pending-2FA JWT TTL. Long enough for a human to find their phone, short
// enough that a stolen pending token isn't a long-lived attack window.
const PENDING_2FA_TTL_SECONDS = 5 * 60;

// JWT marker so the verify endpoint can refuse access/refresh tokens that
// might accidentally land on this codepath.
const PENDING_2FA_TYP = "pending_2fa";

// Per-user lockout — caps the total attack rate against ONE account
// regardless of source IP. The ThrottlerModule guards the same endpoint
// per-IP; this is the second layer for distributed brute-force.
//
// 10 failures in 15 minutes = sustained attempts faster than a human is
// realistic for. The lockout auto-expires (no row deletion needed) because
// the count is over a sliding window. A successful verify wipes the table
// so a user who fat-fingered a few times doesn't carry a half-spent budget.
const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_WINDOW_MINUTES = 15;

@Injectable()
export class TotpService {
  private readonly log = new Logger(TotpService.name);

  constructor(
    private readonly totp: TotpRepository,
    private readonly users: UsersRepository,
    private readonly config: ConfigService,
    // forwardRef because AuthService eventually imports TotpService to call
    // requiresTwoFactor + mintPending2faToken at Google-callback time.
    @Inject(forwardRef(() => AuthService))
    private readonly auth: AuthService
  ) {}

  // ── Setup flow ────────────────────────────────────────────────────────

  // Step 1: generate a secret + QR. Doesn't write anything; the secret is
  // returned to the caller and round-tripped via the otpauth URI / QR.
  // Persistence happens in setup-verify only — so an aborted setup doesn't
  // leave a dangling secret on the user row.
  //
  // We embed the secret directly in the otpauth URI rather than persisting
  // it pre-verify because: (a) the user might never finish; (b) if they did
  // half the flow on two browsers we'd have a race on which secret "wins".
  // Trade-off: a setup-begin can be replayed by an attacker who's already
  // stolen the user's session — but the same attacker can also just call
  // setup-verify and finish enrollment. The session itself is the soft spot,
  // not this flow.
  async setupBegin(user_id: string): Promise<TotpSetupBeginResult> {
    const user = await this.users.findById(user_id);
    if (!user) throw new NotFoundException("user not found");
    if (!user.is_admin) {
      // Defence-in-depth — the controller also guards by AdminGuard, but
      // checking here keeps the service self-protective if it's ever
      // wired into a non-admin route.
      throw new ForbiddenException("2FA is admin-only");
    }
    if (user.totp_secret) {
      // Already enrolled. Force disable-first rather than silently rotating —
      // a user who already has 2FA and gets here might be mid-attack.
      throw new BadRequestException("2FA already enabled — disable first");
    }

    const secret_b32 = authenticator.generateSecret();
    const issuer = "Finshark";
    const otpauth_uri = authenticator.keyuri(user.email, issuer, secret_b32);
    // toDataURL returns a "data:image/png;base64,..." string that the
    // frontend uses verbatim as <img src>.
    const qr_data_url = await QRCode.toDataURL(otpauth_uri, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
    });

    return { secret_b32, qr_data_url, otpauth_uri };
  }

  // Step 2: verify the first code, persist the secret, generate recovery
  // codes (returned ONCE — frontend MUST show them and the user MUST save
  // them). The plaintext codes never leave this method's return value.
  async setupVerify(opts: {
    user_id: string;
    secret_b32: string;
    code: string;
    ip: string | null;
  }): Promise<TotpSetupVerifyResult> {
    const user = await this.users.findById(opts.user_id);
    if (!user) throw new NotFoundException("user not found");
    if (!user.is_admin) throw new ForbiddenException("2FA is admin-only");
    if (user.totp_secret) {
      throw new BadRequestException("2FA already enabled — disable first");
    }

    if (!this.verifyTotpCode(opts.secret_b32, opts.code)) {
      // Setup-verify is pre-enrollment, so it doesn't count toward the
      // lockout window (the user has no enrolled secret yet — there's
      // nothing to brute-force). Just fail.
      throw new UnauthorizedException("invalid 2FA code");
    }

    // Generate recovery codes, hash them, persist hashes + the secret in
    // the same logical transaction (two calls — enroll() and
    // replaceRecoveryCodes() — but if either fails the admin can re-run
    // setup since totp_secret is still NULL at that point).
    const plaintextCodes = this.generateRecoveryCodes();
    const hashes = plaintextCodes.map((c) => this.hashRecoveryCode(c));

    await this.totp.enroll({
      user_id: opts.user_id,
      secret_b32: opts.secret_b32,
    });
    await this.totp.replaceRecoveryCodes({
      user_id: opts.user_id,
      hashes,
    });

    this.log.warn(`2FA enrolled for admin user ${opts.user_id}`);
    await this.recordAudit(opts.user_id, "enrolled", opts.ip);
    return { ok: true, recovery_codes: plaintextCodes };
  }

  // Disable. Requires the user to pass a current 6-digit code as proof of
  // possession — without this, an attacker who hijacked a session could
  // strip the second factor. Recovery codes ALSO work here: if the user
  // lost their phone, they can disable from a backup. Same code path as
  // login verification.
  async disable(opts: {
    user_id: string;
    code: string;
    ip: string | null;
  }): Promise<{ ok: true }> {
    const user = await this.users.findById(opts.user_id);
    if (!user) throw new NotFoundException("user not found");
    if (!user.totp_secret) {
      throw new BadRequestException("2FA not enabled");
    }

    // Lockout applies here too — disable is just as sensitive as a login
    // verify (an attacker stripping the factor is exactly the threat).
    await this.enforceLockout(opts.user_id, opts.ip);

    const ok = await this.verifyTotpOrRecovery(
      user.id,
      user.totp_secret,
      opts.code,
      opts.ip,
      "disable"
    );
    if (!ok) throw new UnauthorizedException("invalid 2FA code");

    await this.totp.disable(opts.user_id);
    this.log.warn(`2FA disabled for admin user ${opts.user_id}`);
    await this.recordAudit(opts.user_id, "disabled", opts.ip);
    // Clear failed-attempts on success (also covers the case where the
    // user fat-fingered a few times before getting it right).
    await this.totp.clearFailedAttempts(opts.user_id).catch(() => {});
    return { ok: true };
  }

  // Regenerate recovery codes — invalidates the previous set and returns
  // a fresh batch of 10. Requires a current code as proof of possession
  // (same threat model as disable). Useful when:
  //   - The user used most of their codes and wants a fresh set.
  //   - The user thinks the codes might have been seen by someone else.
  //
  // The returned codes are surfaced ONCE; the frontend must require the
  // "I saved them" confirmation, identical to first-time enrollment.
  async regenerateRecoveryCodes(opts: {
    user_id: string;
    code: string;
    ip: string | null;
  }): Promise<TotpSetupVerifyResult> {
    const user = await this.users.findById(opts.user_id);
    if (!user) throw new NotFoundException("user not found");
    if (!user.is_admin) throw new ForbiddenException("2FA is admin-only");
    if (!user.totp_secret) {
      throw new BadRequestException("2FA not enabled");
    }

    await this.enforceLockout(opts.user_id, opts.ip);

    const ok = await this.verifyTotpOrRecovery(
      user.id,
      user.totp_secret,
      opts.code,
      opts.ip,
      "regenerate"
    );
    if (!ok) throw new UnauthorizedException("invalid 2FA code");

    const plaintextCodes = this.generateRecoveryCodes();
    const hashes = plaintextCodes.map((c) => this.hashRecoveryCode(c));
    await this.totp.replaceRecoveryCodes({
      user_id: opts.user_id,
      hashes,
    });

    this.log.warn(
      `2FA recovery codes regenerated for admin user ${opts.user_id}`
    );
    await this.recordAudit(
      opts.user_id,
      "recovery_codes_regenerated",
      opts.ip,
      {
        count: plaintextCodes.length,
      }
    );
    await this.totp.clearFailedAttempts(opts.user_id).catch(() => {});
    return { ok: true, recovery_codes: plaintextCodes };
  }

  // Read-only status — used by Settings to render the enable/disable
  // affordance. Doesn't leak secret or recovery state.
  async status(user_id: string): Promise<TotpStatusResult> {
    const user = await this.users.findById(user_id);
    if (!user) throw new NotFoundException("user not found");
    return {
      enabled: user.totp_secret !== null,
      enrolled_at: user.totp_enrolled_at
        ? user.totp_enrolled_at.toISOString()
        : null,
    };
  }

  // Audit-log read for the current user. Used by a "2FA history" UI surface
  // (not yet built — endpoint exists so admins have visibility into their
  // own account's security events). Returns most-recent-first.
  async getAuditLog(user_id: string) {
    return this.totp.listAuditEvents({ user_id, limit: 50 });
  }

  // Count of unused recovery codes — surfaced in Settings so the user knows
  // when they're running low and should regenerate.
  async getRemainingRecoveryCodes(user_id: string): Promise<number> {
    return this.totp.countUnusedRecoveryCodes(user_id);
  }

  // ── Login enforcement ─────────────────────────────────────────────────

  // Called by AuthService.handleGoogleCallback to decide whether the user
  // needs a second-factor step before getting access/refresh tokens. Returns
  // false for: non-admins, admins without 2FA enrolled. Returns true only
  // for admins with totp_secret set.
  requiresTwoFactor(user: {
    is_admin: boolean;
    totp_secret: string | null;
  }): boolean {
    return user.is_admin && user.totp_secret !== null;
  }

  // Mint a short-lived pending-2FA JWT carrying the user id. This is what
  // the frontend gets back from the Google callback when 2FA is required —
  // they hold this while the user types the 6-digit code, then POST it back
  // to /auth/2fa-verify with the code.
  //
  // Uses JWT_ACCESS_SECRET (we already have it) with a `typ: 'pending_2fa'`
  // marker so verify can reject regular access tokens accidentally passed.
  mintPending2faToken(user_id: string): string {
    const secret = this.config.getOrThrow<string>("JWT_ACCESS_SECRET");
    return this.signPending(user_id, secret);
  }

  // Verify a pending-2FA token + code (TOTP or recovery), then issue real
  // session tokens. This is the gateway from "Google verified you" to
  // "you're now signed in". The caller (auth controller) returns the result
  // to the frontend exactly like a normal sign-in result.
  async verifyAndIssueTokens(opts: {
    pending_2fa_token: string;
    code: string;
    ip: string | null;
  }): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user_id = this.verifyPending(opts.pending_2fa_token);
    const user = await this.users.findById(user_id);
    if (!user) throw new UnauthorizedException("invalid 2FA challenge");
    if (!user.totp_secret) {
      // The pending token was issued for a user who has since disabled 2FA.
      // Don't silently succeed — fail closed; they should re-do Google.
      throw new UnauthorizedException("2FA not enabled");
    }

    // Per-user lockout — runs BEFORE we even attempt validation so a
    // locked-out account can't burn cycles checking. The same 401 surface
    // as a wrong code (don't leak whether lockout vs invalid input).
    await this.enforceLockout(user.id, opts.ip);

    const ok = await this.verifyTotpOrRecovery(
      user.id,
      user.totp_secret,
      opts.code,
      opts.ip,
      "login"
    );
    if (!ok) throw new UnauthorizedException("invalid 2FA code");

    // Success — clear the failure budget so a future fat-finger doesn't
    // hit the lockout immediately.
    await this.totp.clearFailedAttempts(user.id).catch(() => {});

    // Delegate token issuance to AuthService so refresh-token persistence
    // and any future hooks (last-login bump, audit) stay in one place.
    const tokens = await this.auth.issueTokensForUser(user);
    return { user: toPublicUser(user), tokens };
  }

  // ── Internals ─────────────────────────────────────────────────────────

  // Check per-user lockout. If the user has too many recent failures,
  // emit a 'locked_out' audit row (once per breach — we don't spam audit
  // every probe) and throw the same 401 we'd throw for a bad code. The
  // attacker learns nothing about why we refused.
  //
  // We DON'T persist a "locked_until" timestamp — the lockout is implicit
  // in the count over the sliding window. As old rows age out of the
  // window, the user becomes unlocked naturally.
  private async enforceLockout(
    user_id: string,
    ip: string | null
  ): Promise<void> {
    const recent = await this.totp.countRecentFailedAttempts({
      user_id,
      window_minutes: LOCKOUT_WINDOW_MINUTES,
    });
    if (recent >= LOCKOUT_THRESHOLD) {
      // Emit audit only on transition (recent === threshold means this is
      // the first call to refuse). Subsequent refuses are noisy and don't
      // add forensic value beyond the original lock-out event.
      if (recent === LOCKOUT_THRESHOLD) {
        await this.recordAudit(user_id, "locked_out", ip, {
          recent_failures: recent,
          window_minutes: LOCKOUT_WINDOW_MINUTES,
        });
      }
      // Same wording as a bad code so we don't disclose the lockout state.
      throw new UnauthorizedException("invalid 2FA code");
    }
  }

  // 6-digit TOTP check. Trim/strip whitespace so a paste with a space
  // doesn't fail. otplib.check is constant-time internally.
  private verifyTotpCode(secret_b32: string, raw: string): boolean {
    const cleaned = (raw ?? "").replace(/\s+/g, "");
    if (!/^\d{6}$/.test(cleaned)) return false;
    try {
      return authenticator.check(cleaned, secret_b32);
    } catch {
      return false;
    }
  }

  // Try the input as a TOTP first (fast, no DB). If it's not 6 digits OR
  // it doesn't match TOTP, fall through to recovery-code matching against
  // the user's unused codes.
  //
  // Records a failed-attempt row on any non-match, so the lockout count is
  // accurate. Records the recovery-consumed audit event on a recovery hit.
  // `context` distinguishes login / disable / regenerate in the audit meta.
  private async verifyTotpOrRecovery(
    user_id: string,
    secret_b32: string,
    raw: string,
    ip: string | null,
    context: "login" | "disable" | "regenerate"
  ): Promise<boolean> {
    const cleanedDigits = (raw ?? "").replace(/\s+/g, "");
    if (/^\d{6}$/.test(cleanedDigits)) {
      if (this.verifyTotpCode(secret_b32, cleanedDigits)) return true;
      // 6 digits but didn't validate — DON'T fall through to recovery, that
      // would let an attacker who guesses six digits also burn a recovery
      // code attempt for free. They're disjoint formats.
      await this.totp.recordFailedAttempt({ user_id, ip }).catch(() => {});
      return false;
    }
    // Otherwise treat as recovery code.
    const normalized = this.normalizeRecoveryCode(raw);
    if (!normalized) {
      await this.totp.recordFailedAttempt({ user_id, ip }).catch(() => {});
      return false;
    }
    const candidates = await this.totp.findUnusedRecoveryCodes(user_id);
    for (const row of candidates) {
      if (this.verifyRecoveryHash(normalized, row.code_hash)) {
        // Mark this specific row used. If another concurrent request beat
        // us to it (consumeRecoveryCode returns false), the user typed a
        // valid code but it was just consumed — treat as failure so we
        // don't double-issue tokens for one code.
        const consumed = await this.totp.consumeRecoveryCode(row.id);
        if (consumed) {
          const remaining = await this.totp.countUnusedRecoveryCodes(user_id);
          await this.recordAudit(user_id, "recovery_code_consumed", ip, {
            remaining,
            context,
          });
        }
        return consumed;
      }
    }
    await this.totp.recordFailedAttempt({ user_id, ip }).catch(() => {});
    return false;
  }

  // Thin wrapper around the repository's audit insert. Swallows + logs
  // errors — audit must NEVER break the operation it's recording. (If the
  // audit row fails to write we still want the verify/setup to succeed.)
  private async recordAudit(
    user_id: string,
    event:
      | "enrolled"
      | "disabled"
      | "recovery_codes_regenerated"
      | "recovery_code_consumed"
      | "locked_out",
    ip: string | null,
    meta?: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.totp.recordAuditEvent({ user_id, event, ip, meta });
    } catch (err) {
      this.log.error(
        `audit insert failed for user ${user_id} / event ${event}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  // ── Recovery codes ────────────────────────────────────────────────────

  private generateRecoveryCodes(): string[] {
    const out: string[] = [];
    for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
      const groups: string[] = [];
      for (let g = 0; g < RECOVERY_CODE_GROUPS; g++) {
        let s = "";
        // crypto.randomInt is uniformly distributed; using % on randomBytes
        // would bias the alphabet.
        for (let c = 0; c < RECOVERY_CODE_GROUP_LEN; c++) {
          const idx = crypto.randomInt(0, RECOVERY_CODE_ALPHABET.length);
          s += RECOVERY_CODE_ALPHABET[idx];
        }
        groups.push(s);
      }
      out.push(groups.join("-"));
    }
    return out;
  }

  // Accept input with or without dashes, case-insensitive. Returns the
  // canonical form ("ABCDE-FGHIJ-..."). null if the input clearly isn't a
  // recovery-code shape (so we can fail fast without scanning the DB).
  private normalizeRecoveryCode(raw: string): string | null {
    if (!raw) return null;
    const stripped = raw.replace(/[\s-]/g, "").toUpperCase();
    const expectedLen = RECOVERY_CODE_GROUPS * RECOVERY_CODE_GROUP_LEN;
    if (stripped.length !== expectedLen) return null;
    // Validate every char is in the alphabet — protects against weird
    // input getting hashed and accidentally colliding.
    for (const ch of stripped) {
      if (!RECOVERY_CODE_ALPHABET.includes(ch)) return null;
    }
    // Re-insert dashes for canonical form (matches the format generated).
    const groups: string[] = [];
    for (let i = 0; i < RECOVERY_CODE_GROUPS; i++) {
      groups.push(
        stripped.slice(
          i * RECOVERY_CODE_GROUP_LEN,
          (i + 1) * RECOVERY_CODE_GROUP_LEN
        )
      );
    }
    return groups.join("-");
  }

  // Hash a recovery code with scrypt. Stored as "salt:derivedKey" both hex.
  // The salt is unique per code so identical codes (vanishingly unlikely)
  // get different hashes.
  private hashRecoveryCode(code: string): string {
    const normalized = this.normalizeRecoveryCode(code);
    if (!normalized) {
      throw new Error("cannot hash malformed recovery code");
    }
    const salt = crypto.randomBytes(SCRYPT_SALT_BYTES);
    const derived = crypto.scryptSync(normalized, salt, SCRYPT_KEYLEN, {
      N: SCRYPT_N,
    });
    return `${salt.toString("hex")}:${derived.toString("hex")}`;
  }

  // Constant-time compare against a stored "salt:key" hash.
  private verifyRecoveryHash(plaintext: string, stored: string): boolean {
    const parts = stored.split(":");
    if (parts.length !== 2) return false;
    const saltHex = parts[0];
    const keyHex = parts[1];
    try {
      const salt = Buffer.from(saltHex, "hex");
      const expected = Buffer.from(keyHex, "hex");
      const actual = crypto.scryptSync(plaintext, salt, SCRYPT_KEYLEN, {
        N: SCRYPT_N,
      });
      if (actual.length !== expected.length) return false;
      return crypto.timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }

  // ── Pending-2FA JWT (tiny, self-contained — no DB) ────────────────────

  // We use the symmetric JWT secret already in play (JWT_ACCESS_SECRET) but
  // mark the payload with typ='pending_2fa'. The verify endpoint refuses
  // anything else, and the JwtAuthGuard for regular routes refuses payloads
  // missing email/sub in the AccessTokenPayload shape. Belt + braces.
  private signPending(user_id: string, secret: string): string {
    return jwt.sign({ sub: user_id, typ: PENDING_2FA_TYP }, secret, {
      expiresIn: PENDING_2FA_TTL_SECONDS as jwt.SignOptions["expiresIn"],
    });
  }

  // Returns the user_id if the token is valid AND has typ='pending_2fa'.
  // Throws UnauthorizedException otherwise. We deliberately throw the same
  // error for expired vs typ-mismatch vs bad signature — no oracle for an
  // attacker probing tokens.
  private verifyPending(token: string): string {
    const secret = this.config.getOrThrow<string>("JWT_ACCESS_SECRET");
    try {
      const decoded = jwt.verify(token, secret) as {
        sub?: string;
        typ?: string;
      };
      if (decoded.typ !== PENDING_2FA_TYP) {
        throw new UnauthorizedException("invalid 2FA challenge");
      }
      if (!decoded.sub) {
        throw new UnauthorizedException("invalid 2FA challenge");
      }
      return decoded.sub;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException("invalid 2FA challenge");
    }
  }
}
