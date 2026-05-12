import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly config: ConfigService,
  ) {}

  async register(input: {
    email: string;
    password: string;
    display_name: string;
  }): Promise<AuthResult> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      // Don't leak whether email exists in prod via timing? For MVP, plain 409 is fine.
      throw new ConflictException('email already registered');
    }

    const rounds = parseInt(this.config.get<string>('BCRYPT_ROUNDS') ?? '10', 10);
    const password_hash = await bcrypt.hash(input.password, rounds);

    const user = await this.users.create({
      email: input.email,
      password_hash,
      display_name: input.display_name,
    });

    const tokens = await this.issueTokens(user);
    return { user: toPublicUser(user), tokens };
  }

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      // Constant message to avoid user enumeration.
      throw new UnauthorizedException('invalid credentials');
    }

    const ok = await bcrypt.compare(input.password, user.password_hash);
    if (!ok) {
      throw new UnauthorizedException('invalid credentials');
    }

    const tokens = await this.issueTokens(user);
    return { user: toPublicUser(user), tokens };
  }

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

  // ---- internals ----

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

  // Used by JwtAuthGuard to verify access tokens.
  verifyAccessToken(token: string): AccessTokenPayload {
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    try {
      return jwt.verify(token, accessSecret) as AccessTokenPayload;
    } catch {
      throw new UnauthorizedException('invalid access token');
    }
  }
}
