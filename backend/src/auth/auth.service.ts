import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { UsersRepository } from '../users/users.repository';
import { toPublicUser, type PublicUser, type UserRow } from '../users/user.types';
import { RefreshTokensRepository } from './refresh-tokens.repository';

// Payload baked into the access JWT.
export interface AccessTokenPayload {
  sub: string;        // user id
  email: string;
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
export interface GoogleCallbackResult {
  user: PublicUser;
  tokens: AuthTokens;
}

// Internal state token format: "<random_nonce>.<hmac>". Signed with
// GOOGLE_OAUTH_STATE_SECRET so we can verify it on the callback without
// storing anything server-side.
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes — plenty for any human flow

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);
  private googleClient: OAuth2Client | null = null;

  constructor(
    private readonly users: UsersRepository,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly config: ConfigService,
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
      access_type: 'online',
      scope: ['openid', 'email', 'profile'],
      // Lets the user pick which Google account if they're signed into multiple.
      // Remove to auto-pick the only signed-in account when there's one.
      prompt: 'select_account',
      state,
    });

    return { url, state };
  }

  // Handle Google's callback. Verifies state, exchanges code for ID token,
  // verifies ID token signature, looks up / creates the user, returns our tokens.
  async handleGoogleCallback(input: {
    code: string;
    state: string;
    expectedState: string;     // from the cookie the user's browser sent back
  }): Promise<GoogleCallbackResult> {
    // 1) CSRF protection: cookie value must match the state in the URL exactly
    //    AND must verify against our HMAC secret. Without the cookie check, an
    //    attacker could forge a state and link their Google account to a victim.
    if (!input.state || input.state !== input.expectedState) {
      throw new UnauthorizedException('state mismatch');
    }
    if (!this.verifyState(input.state)) {
      throw new UnauthorizedException('state invalid or expired');
    }

    // 2) Exchange the auth code for tokens from Google.
    const client = this.getGoogleClient();
    let tokens: { id_token?: string | null };
    try {
      const res = await client.getToken(input.code);
      tokens = res.tokens;
    } catch (e) {
      this.log.warn(`google token exchange failed: ${(e as Error).message}`);
      throw new UnauthorizedException('google token exchange failed');
    }

    if (!tokens.id_token) {
      throw new UnauthorizedException('google did not return an id token');
    }

    // 3) Verify the ID token. google-auth-library handles JWKs, signature,
    //    issuer, audience, expiry — everything. If anything's off it throws.
    const clientId = this.config.getOrThrow<string>('GOOGLE_OAUTH_CLIENT_ID');
    let payload: {
      sub?: string;
      email?: string;
      email_verified?: boolean;
      name?: string;
      given_name?: string;
    };
    try {
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: clientId,
      });
      payload = ticket.getPayload() ?? {};
    } catch (e) {
      this.log.warn(`google id token verification failed: ${(e as Error).message}`);
      throw new UnauthorizedException('google id token verification failed');
    }

    const google_sub = payload.sub;
    const email = payload.email;
    if (!google_sub || !email) {
      throw new UnauthorizedException('google profile missing sub or email');
    }
    // We trust Google's email_verified — they DO verify emails before issuing
    // tokens with email_verified: true. Reject anything that isn't verified.
    if (payload.email_verified !== true) {
      throw new UnauthorizedException('google email not verified');
    }

    // 4) Look up by google_sub first (the stable identifier).
    //    If not found, try email — if a row matches by email but doesn't have
    //    google_sub yet, attach it (auto-link). Otherwise create a fresh user.
    let user = await this.users.findByGoogleSub(google_sub);
    if (!user) {
      const byEmail = await this.users.findByEmail(email);
      if (byEmail) {
        // Auto-link: email matched but no google_sub. In a hard-cutover world
        // this is rare — it'd only happen if a row was created out-of-band.
        // Kept for completeness.
        user = await this.users.attachGoogleSubByEmail({ email, google_sub });
      }
    }
    if (!user) {
      // First-time login from a fresh Google account.
      const display_name =
        payload.name?.trim() || payload.given_name?.trim() || email.split('@')[0];
      user = await this.users.createFromGoogle({
        email,
        google_sub,
        display_name,
      });
    }

    const ourTokens = await this.issueTokens(user);
    return { user: toPublicUser(user), tokens: ourTokens };
  }

  // ---- Our own session tokens (unchanged from password-era) ----

  // Verify and rotate. The presented refresh token is hashed and looked up;
  // on success the old one is revoked and a new pair is issued.
  async refresh(refresh_token: string): Promise<AuthTokens> {
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');

    let payload: AccessTokenPayload & jwt.JwtPayload;
    try {
      payload = jwt.verify(refresh_token, refreshSecret) as AccessTokenPayload &
        jwt.JwtPayload;
    } catch {
      throw new UnauthorizedException('invalid refresh token');
    }

    const token_hash = this.hashToken(refresh_token);
    const stored = await this.refreshTokens.findActiveByHash(token_hash);
    if (!stored) {
      // Token is either revoked, expired, or not ours (e.g. forged with leaked secret
      // but never stored). Either way: reject.
      throw new UnauthorizedException('refresh token not recognized');
    }

    if (stored.user_id !== payload.sub) {
      // Defensive: someone tampered with the token claims.
      throw new UnauthorizedException('refresh token mismatch');
    }

    const user = await this.users.findById(stored.user_id);
    if (!user) {
      throw new UnauthorizedException('user no longer exists');
    }

    // Rotate: revoke the old, issue new pair.
    await this.refreshTokens.revokeById(stored.id);
    return this.issueTokens(user);
  }

  // Logout: revoke the presented refresh token. Idempotent — if the token is
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
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    try {
      return jwt.verify(token, accessSecret) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedException('invalid access token');
    }
  }

  // ---- internals ----

  private getGoogleClient(): OAuth2Client {
    // Lazy init; reused across requests.
    if (!this.googleClient) {
      this.googleClient = new OAuth2Client({
        clientId: this.config.getOrThrow<string>('GOOGLE_OAUTH_CLIENT_ID'),
        clientSecret: this.config.getOrThrow<string>('GOOGLE_OAUTH_CLIENT_SECRET'),
        redirectUri: this.config.getOrThrow<string>('GOOGLE_OAUTH_REDIRECT_URI'),
      });
    }
    return this.googleClient;
  }

  // State token format: "<nonce>.<expiresAtMs>.<hmac>".
  // Verifying requires the same HMAC secret AND not-yet-expired.
  private signState(): string {
    const secret = this.config.getOrThrow<string>('GOOGLE_OAUTH_STATE_SECRET');
    const nonce = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + STATE_TTL_MS;
    const body = `${nonce}.${expiresAt}`;
    const hmac = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return `${body}.${hmac}`;
  }

  private verifyState(state: string): boolean {
    const secret = this.config.getOrThrow<string>('GOOGLE_OAUTH_STATE_SECRET');
    const parts = state.split('.');
    if (parts.length !== 3) return false;
    const [nonce, expiresAtStr, hmac] = parts;
    const body = `${nonce}.${expiresAtStr}`;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');

    // timingSafeEqual requires equal-length buffers.
    const a = Buffer.from(hmac, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
    return true;
  }

  private async issueTokens(user: UserRow): Promise<AuthTokens> {
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL') ?? '15m';
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL') ?? '30d';

    const payload: AccessTokenPayload = { sub: user.id, email: user.email };

    const access_token = jwt.sign(payload, accessSecret, {
      expiresIn: accessTtl as jwt.SignOptions['expiresIn'],
    });
    const refresh_token = jwt.sign(payload, refreshSecret, {
      expiresIn: refreshTtl as jwt.SignOptions['expiresIn'],
    });

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

  // SHA-256 is fine here: refresh tokens are already high-entropy JWTs,
  // so we're storing a fingerprint, not protecting a low-entropy secret.
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
