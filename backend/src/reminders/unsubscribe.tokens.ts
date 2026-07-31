import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";

// Pinned on both sides so sign and verify can never drift apart.
const ALGORITHM = "HS256" as const;

interface UnsubscribePayload {
  sub: string; // user id
  purpose: "unsub";
}

@Injectable()
export class UnsubscribeTokens {
  constructor(private readonly config: ConfigService) {}

  // Tokens never expire - unsubscribe should always work, even years later.
  // That is a deliberate trade: the token is a permanent bearer credential, but
  // the only thing it can do is turn reminder emails off for one user, and the
  // operation is idempotent. An expiring token would break the "unsubscribe
  // link in a two-year-old email" case, which regulators care about more.
  sign(user_id: string): string {
    const secret = this.config.getOrThrow<string>("UNSUBSCRIBE_SECRET");
    const payload: UnsubscribePayload = { sub: user_id, purpose: "unsub" };
    return jwt.sign(payload, secret, { algorithm: ALGORITHM });
  }

  // Returns the user_id if the token is valid, else null.
  //
  // `algorithms` is pinned rather than left to the library's default. Without
  // it, verification accepts whatever `alg` the TOKEN declares, which is the
  // shape of the classic JWT algorithm-confusion attack. It is not exploitable
  // here (the secret is symmetric, not a public key, and jsonwebtoken rejects
  // `alg: none` unless it is explicitly allowed) - but the endpoint is
  // UNAUTHENTICATED and the token never expires, so it is the last place worth
  // relying on a library default.
  verify(token: string): string | null {
    const secret = this.config.getOrThrow<string>("UNSUBSCRIBE_SECRET");
    try {
      const payload = jwt.verify(token, secret, {
        algorithms: [ALGORITHM],
      }) as UnsubscribePayload;
      // Stops a token minted for some other purpose against the same secret
      // from being replayed here.
      if (payload.purpose !== "unsub") return null;
      if (typeof payload.sub !== "string" || payload.sub === "") return null;
      return payload.sub;
    } catch {
      return null;
    }
  }
}
