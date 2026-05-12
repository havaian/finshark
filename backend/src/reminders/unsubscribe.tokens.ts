import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

interface UnsubscribePayload {
  sub: string;       // user id
  purpose: 'unsub';
}

@Injectable()
export class UnsubscribeTokens {
  constructor(private readonly config: ConfigService) {}

  // Tokens never expire — unsubscribe should always work, even years later.
  sign(user_id: string): string {
    const secret = this.config.getOrThrow<string>('UNSUBSCRIBE_SECRET');
    const payload: UnsubscribePayload = { sub: user_id, purpose: 'unsub' };
    return jwt.sign(payload, secret);
  }

  // Returns the user_id if the token is valid, else null.
  verify(token: string): string | null {
    const secret = this.config.getOrThrow<string>('UNSUBSCRIBE_SECRET');
    try {
      const payload = jwt.verify(token, secret) as UnsubscribePayload;
      if (payload.purpose !== 'unsub') return null;
      return payload.sub;
    } catch {
      return null;
    }
  }
}
