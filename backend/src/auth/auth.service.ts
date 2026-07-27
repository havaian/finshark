import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  forwardRef,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { UsersRepository } from "../users/users.repository";
import {
  toPublicUser,
  type PublicUser,
  type UserRow,
} from "../users/user.types";
import { WhitelistService } from "../whitelist/whitelist.service";
import { TotpService } from "../totp/totp.service";
import { RefreshTokensRepository } from "./refresh-tokens.repository";

// Payload baked into the access JWT.
export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  // Admin 2FA elevation marker. Present and true only on tokens minted by the
  // /auth/2fa-elevate step (an already-authenticated admin who passed a TOTP/
  // recovery code). Absent on ordinary login tokens. AdminWith2faGuard requires
  // it before letting an enrolled admin into admin endpoints, so login itself
  // never demands 2FA - only entering the admin area does. Carried through
  // refresh (see refresh()) so elevation survives access-token rotation for the
  // life of the session, per the chosen lifetime model.
  adm2fa?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

// Returned to the controller after a successful Google callback.
// The controller is responsible for the final redirect to the frontend.
//
// Discriminated union: most users get `kind: 'authenticated'` with tokens
// ready to go. Admins with 2FA enrolled get `kind: 'two_factor_required'`
// with a short-lived pending token that the frontend swaps for real tokens
// at /auth/2fa-verify. The PublicUser is intentionally NOT returned in the
// pending case - we don't want to leak account existence/details until the
// second factor clears.
export type GoogleCallbackResult =
  | { kind: "authenticated"; user: PublicUser; tokens: AuthTokens }
  | { kind: "two_factor_required"; pending_2fa_token: string };

// Internal state token format: "<random_nonce>.<hmac>". Signed with
// GOOGLE_OAUTH_STATE_SECRET so we can verify it on the callback without
// storing anything server-side.
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes - plenty for any human flow

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);
  private googleClient: OAuth2Client | null = null;

  constructor(
    private readonly users: UsersRepository,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly config: ConfigService,
    // forwardRef because WhitelistModule itself imports AuthModule for the
    // admin-route guards.
    @Inject(forwardRef(() => WhitelistService))
    private readonly whitelist: WhitelistService,
    // forwardRef because TotpModule depends on AuthService (to mint tokens
    // after a successful 2FA verify), and AuthService needs TotpService to
    // gate the Google callback on admin 2FA. Two-way dependency resolved
    // via Nest's forwardRef on both sides.
    @Inject(forwardRef(() => TotpService))
    private readonly totp: TotpService
  ) {}

  // ---- Google OAuth flow ----

  // Build the URL we redirect the user to for them to consent at Google.
  // Returns the URL and the `state` value (which the controller writes to a cookie).
  buildGoogleAuthUrl(): { url: string; state: string } {
    const client = this.getGoogleClient();
    const state = this.signState();

    const url = client.generateAuthUrl({
      // 'online' = no refresh_token from Google. We don't call Google APIs after
      // sign-in, so we don't need offline access.
      access_type: "online",
      scope: ["openid", "email", "profile"],
      // Lets the user pick which Google account if they're signed into multiple.
      // Remove to auto-pick the only signed-in account when there's one.
      prompt: "select_account",
      state,
    });

    return { url, state };
  }

  // Handle Google's callback. Verifies state, exchanges code for ID token,
  // verifies ID token signature, looks up / creates the user, returns our tokens.
  async handleGoogleCallback(input: {
    code: string;
    state: string;
    expectedState: string; // from the cookie the user's browser sent back
  }): Promise<GoogleCallbackResult> {
    // 1) CSRF protection: cookie value must match the state in the URL exactly
    //    AND must verify against our HMAC secret. Without the cookie check, an
    //    attacker could forge a state and link their Google account to a victim.
    if (!input.state || input.state !== input.expectedState) {
      throw new UnauthorizedException("state mismatch");
    }
    if (!this.verifyState(input.state)) {
      throw new UnauthorizedException("state invalid or expired");
    }

    // 2) Exchange the auth code for tokens from Google.
    // Named googleTokens (not just `tokens`) to avoid shadowing the
    // AuthTokens variable declared later in this function for our own
    // session tokens - those are what we actually return to the caller.
    const client = this.getGoogleClient();
    let googleTokens: { id_token?: string | null };
    try {
      const res = await client.getToken(input.code);
      googleTokens = res.tokens;
    } catch (e) {
      this.log.warn(`google token exchange failed: ${(e as Error).message}`);
      throw new UnauthorizedException("google token exchange failed");
    }

    if (!googleTokens.id_token) {
      throw new UnauthorizedException("google did not return an id token");
    }

    // 3) Verify the ID token. google-auth-library handles JWKs, signature,
    //    issuer, audience, expiry - everything. If anything's off it throws.
    const clientId = this.config.getOrThrow<string>("GOOGLE_OAUTH_CLIENT_ID");
    let payload: {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      given_name?: string;
    };
    try {
      const ticket = await client.verifyIdToken({
        idToken: googleTokens.id_token,
        audience: clientId,
      });
      payload = ticket.getPayload() ?? {};
    } catch (e) {
      this.log.warn(
        `google id token verification failed: ${(e as Error).message}`
      );
      throw new UnauthorizedException("google id token verification failed");
    }

    const google_sub = payload.sub;
    const email = payload.email;
    if (!google_sub || !email) {
      throw new UnauthorizedException("google profile missing sub or email");
    }
    // We trust Google's email_verified - they DO verify emails before issuing
    // tokens with email_verified: true. Reject anything that isn't verified.
    if (payload.email_verified !== true) {
      throw new UnauthorizedException("google email not verified");
    }

    // Whitelist gate. Sits AFTER Google's email verification so we don't waste
    // a DB hit on forged tokens. Sits BEFORE the user lookup/creation so an
    // un-whitelisted email never produces a user row (no surprise accounts).
    //
    // The frontend's /auth/callback page reads the URL fragment, so we surface
    // a specific error code "email_not_allowed" that the page can localise
    // into a friendlier message than the generic "auth failed".
    const allowed = await this.whitelist.isEmailAllowed(email);
    if (!allowed) {
      this.log.warn(`whitelist rejected sign-in for ${email}`);
      throw new UnauthorizedException("email_not_allowed");
    }

    // 4) Look up by google_sub first (the stable identifier).
    //    If not found, try email - if a row matches by email but doesn't have
    //    google_sub yet, attach it (auto-link). Otherwise create a fresh user.
    let user = await this.users.findByGoogleSub(google_sub);
    if (!user) {
      const byEmail = await this.users.findByEmail(email);
      if (byEmail) {
        // Auto-link: email matched but no google_sub. In a hard-cutover world
        // this is rare - it'd only happen if a row was created out-of-band.
        // Kept for completeness.
        user = await this.users.attachGoogleSubByEmail({ email, google_sub });
      }
    }
    if (!user) {
      // First-time login from a fresh Google account.
      const display_name =
        payload.name?.trim() ||
        payload.given_name?.trim() ||
        email.split("@")[0];
      user = await this.users.createFromGoogle({
        email,
        google_sub,
        display_name,
      });
    }

    // 2FA is no longer enforced at login. Previously admins with TOTP enrolled
    // were withheld tokens here and forced through a challenge before getting
    // any session - which also blocked them from the ordinary user side. The
    // second factor now gates ADMIN-AREA access only (see TotpService
    // .elevateAdmin2fa + AdminWith2faGuard's elevation check), so every user,
    // admin or not, gets a normal session on login.
    const tokens = await this.issueTokens(user);
    return { kind: "authenticated", user: toPublicUser(user), tokens };
  }

  // ---- Our own session tokens (unchanged from password-era) ----

  // Verify and rotate. The presented refresh token is hashed and looked up;
  // on success the old one is revoked and a new pair is issued.
  async refresh(refresh_token: string): Promise<AuthTokens> {
    const refreshSecret = this.config.getOrThrow<string>("JWT_REFRESH_SECRET");

    let payload: AccessTokenPayload & jwt.JwtPayload;
    try {
      payload = jwt.verify(refresh_token, refreshSecret) as AccessTokenPayload &
        jwt.JwtPayload;
    } catch {
      throw new UnauthorizedException("invalid refresh token");
    }

    const token_hash = this.hashToken(refresh_token);
    const stored = await this.refreshTokens.findActiveByHash(token_hash);
    if (!stored) {
      // Token is either revoked, expired, or not ours (e.g. forged with leaked secret
      // but never stored). Either way: reject.
      throw new UnauthorizedException("refresh token not recognized");
    }

    if (stored.user_id !== payload.sub) {
      // Defensive: someone tampered with the token claims.
      throw new UnauthorizedException("refresh token mismatch");
    }

    const user = await this.users.findById(stored.user_id);
    if (!user) {
      throw new UnauthorizedException("user no longer exists");
    }

    // Carry the admin-2FA elevation forward across rotation. If the presented
    // refresh token was elevated (adm2fa===true), the freshly-minted pair stays
    // elevated; otherwise it stays ordinary. This is what makes elevation last
    // the whole session rather than expiring on the first access-token refresh.
    // Defensive: if the user is no longer an admin, drop the claim regardless -
    // a demoted admin shouldn't keep an elevated session alive.
    const wasElevated = payload.adm2fa === true && user.is_admin === true;

    // Rotate: revoke the old, issue new pair.
    await this.refreshTokens.revokeById(stored.id);
    return this.issueTokens(user, { elevated: wasElevated });
  }

  // Logout: revoke the presented refresh token. Idempotent - if the token is
  // unknown or already revoked, we still return success. Access tokens cannot be
  // revoked server-side, so they expire on their normal short TTL.
  async logout(refresh_token: string): Promise<void> {
    const token_hash = this.hashToken(refresh_token);
    const stored = await this.refreshTokens.findActiveByHash(token_hash);
    if (stored) {
      await this.refreshTokens.revokeById(stored.id);
    }
  }

  // Used by JwtAuthGuard to verify access tokens.
  verifyAccessToken(token: string): AccessTokenPayload {
    const accessSecret = this.config.getOrThrow<string>("JWT_ACCESS_SECRET");
    try {
      return jwt.verify(token, accessSecret) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedException("invalid access token");
    }
  }

  // ---- internals ----

  private getGoogleClient(): OAuth2Client {
    // Lazy init; reused across requests.
    if (!this.googleClient) {
      this.googleClient = new OAuth2Client({
        clientId: this.config.getOrThrow<string>("GOOGLE_OAUTH_CLIENT_ID"),
        clientSecret: this.config.getOrThrow<string>(
          "GOOGLE_OAUTH_CLIENT_SECRET"
        ),
        redirectUri: this.config.getOrThrow<string>(
          "GOOGLE_OAUTH_REDIRECT_URI"
        ),
      });
    }
    return this.googleClient;
  }

  // State token format: "<nonce>.<expiresAtMs>.<hmac>".
  // Verifying requires the same HMAC secret AND not-yet-expired.
  private signState(): string {
    const secret = this.config.getOrThrow<string>("GOOGLE_OAUTH_STATE_SECRET");
    const nonce = crypto.randomBytes(16).toString("hex");
    const expiresAt = Date.now() + STATE_TTL_MS;
    const body = `${nonce}.${expiresAt}`;
    const hmac = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return `${body}.${hmac}`;
  }

  private verifyState(state: string): boolean {
    const secret = this.config.getOrThrow<string>("GOOGLE_OAUTH_STATE_SECRET");
    const parts = state.split(".");
    if (parts.length !== 3) return false;
    const [nonce, expiresAtStr, hmac] = parts;
    const body = `${nonce}.${expiresAtStr}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    // timingSafeEqual requires equal-length buffers.
    const a = Buffer.from(hmac, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
    return true;
  }

  private async issueTokens(
    user: UserRow,
    opts?: { elevated?: boolean }
  ): Promise<AuthTokens> {
    const accessSecret = this.config.getOrThrow<string>("JWT_ACCESS_SECRET");
    const refreshSecret = this.config.getOrThrow<string>("JWT_REFRESH_SECRET");
    const accessTtl = this.config.get<string>("JWT_ACCESS_TTL") ?? "15m";
    const refreshTtl = this.config.get<string>("JWT_REFRESH_TTL") ?? "30d";

    // adm2fa rides BOTH tokens: the access token so AdminWith2faGuard can read
    // it on each admin request, and the refresh token so a rotation (refresh())
    // can carry the elevation forward instead of silently dropping the admin
    // back to un-elevated mid-session. Only set when truthy so ordinary login
    // tokens stay byte-for-byte as before (no adm2fa key at all).
    const payload: AccessTokenPayload = { sub: user.id, email: user.email };
    if (opts?.elevated) payload.adm2fa = true;

    // A JWT's timestamps (iat/exp) are in whole SECONDS, and the signature is a
    // pure function of payload + secret. Two tokens minted for the same user
    // inside one second with the same claims are therefore byte-identical, and
    // their SHA-256 hashes collide on refresh_tokens.token_hash's unique index
    // (a real 23505 seen on rapid login / elevate / refresh). A per-token
    // random jti breaks that tie so every token is distinct regardless of
    // timing. Signed SEPARATELY into each token so access and refresh never
    // share a jti - a stored refresh token then has its own stable identity if
    // we ever need to deny-list one directly.
    const access_token = jwt.sign(
      { ...payload, jti: crypto.randomBytes(16).toString("hex") },
      accessSecret,
      { expiresIn: accessTtl as jwt.SignOptions["expiresIn"] }
    );
    const refresh_token = jwt.sign(
      { ...payload, jti: crypto.randomBytes(16).toString("hex") },
      refreshSecret,
      { expiresIn: refreshTtl as jwt.SignOptions["expiresIn"] }
    );

    // Decode just to read the expiry the lib computed, so we store the same date.
    const decoded = jwt.decode(refresh_token) as jwt.JwtPayload;
    const expires_at = new Date((decoded.exp ?? 0) * 1000);

    await this.refreshTokens.create({
      user_id: user.id,
      token_hash: this.hashToken(refresh_token),
      expires_at,
    });

    return { access_token, refresh_token };
  }

  // Public wrapper around issueTokens for sibling modules (TotpService) that
  // need to mint tokens after a non-Google verification step. Kept narrow:
  // accepts a full UserRow that the caller already loaded, so we don't
  // re-hit the DB. Matches the shape used by handleGoogleCallback. The
  // optional `elevated` flag stamps the admin-2FA claim (used by the
  // /auth/2fa-elevate path).
  async issueTokensForUser(
    user: UserRow,
    opts?: { elevated?: boolean }
  ): Promise<AuthTokens> {
    return this.issueTokens(user, opts);
  }

  // SHA-256 is fine here: refresh tokens are already high-entropy JWTs,
  // so we're storing a fingerprint, not protecting a low-entropy secret.
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}
