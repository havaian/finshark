import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EmailOutboxRepository } from "./email-outbox.repository";
import { EmailTemplatesService } from "./email-templates.service";
import type { EmailLang } from "./email-templates.service";

// Durable delivery for transactional email.
//
// Callers enqueue instead of sending. The drain cron does the actual SMTP work
// and retries anything the relay defers. See the migration for the incident
// that motivated this.
//
// Delay before each RETRY, in minutes. BACKOFF_MINUTES[n - 1] is the wait
// after the nth failed attempt:
//   attempt 1 fails -> wait 1m,  attempt 2 fails -> wait 2m,  then 5, 15,
//   30, 60, 120, 240.
// So there are 8 delays and 9 attempts total, spanning ~7.9 hours. Long
// enough to sit out a mail server outage; short enough that a "your card was
// declined" email never arrives days late, when it confuses more than informs.
const BACKOFF_MINUTES = [1, 2, 5, 15, 30, 60, 120, 240];
const MAX_ATTEMPTS = BACKOFF_MINUTES.length + 1;

const DRAIN_BATCH_SIZE = 50;

// How long a claimed row is held before another drain may pick it up. Must
// comfortably exceed the SMTP timeout so a slow relay does not cause a double
// send; short enough that a killed process does not strand mail for long.
const CLAIM_LEASE_SECONDS = 300;

export interface EnqueueEmailInput {
  templateKey: string;
  to: string;
  lang?: EmailLang;
  variables: Record<string, string | number>;
  // Free-form origin marker shown in the admin panel, e.g. "click order <id>".
  context?: string | null;
}

// SMTP splits failures into 4xx (temporary, ask again) and 5xx (permanent,
// stop asking). Honouring that split is the entire point of this service.
//
// Transport-level errors carry a nodemailer `code` rather than a numeric SMTP
// reply, and are treated as temporary: a refused TCP connection or a DNS blip
// says nothing about whether the message itself is deliverable.
const TEMPORARY_TRANSPORT_CODES = new Set([
  "ECONNECTION",
  "ECONNRESET",
  "ETIMEDOUT",
  "ESOCKET",
  "EDNS",
  "EAI_AGAIN",
  "EPROTOCOL",
]);

function isTemporaryFailure(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return true;
  const e = err as { responseCode?: unknown; code?: unknown };

  // Numeric SMTP reply wins when present - it is the server's own verdict.
  if (typeof e.responseCode === "number") {
    if (e.responseCode >= 500) return false;
    if (e.responseCode >= 400) return true;
  }

  if (typeof e.code === "string" && TEMPORARY_TRANSPORT_CODES.has(e.code)) {
    return true;
  }

  // Unknown shape. Retry rather than discard: a bounded retry of something
  // undeliverable costs a few log lines, whereas dropping a receipt for money
  // already taken costs a support ticket and a user's trust.
  return true;
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

@Injectable()
export class EmailOutboxService {
  private readonly log = new Logger(EmailOutboxService.name);

  // Guards against a slow drain overlapping the next tick. Cheap in-process
  // flag; correctness across instances comes from FOR UPDATE SKIP LOCKED in
  // the repository, not from this.
  private draining = false;

  constructor(
    private readonly repo: EmailOutboxRepository,
    private readonly templates: EmailTemplatesService
  ) {}

  // Enqueue for delivery. Returns the queued row id, or null if the row could
  // not be written.
  //
  // Never throws. Callers are inside payment and grant paths where an email
  // problem must not unwind the transaction that earned the email. A failure
  // here is logged and swallowed, exactly as the old direct-send callers did -
  // but the failure surface is now a single INSERT against our own database
  // rather than a network round trip to a mail relay.
  async enqueue(input: EnqueueEmailInput): Promise<string | null> {
    try {
      const row = await this.repo.insert({
        template_key: input.templateKey,
        to_email: input.to,
        lang: input.lang ?? "en",
        variables: input.variables,
        context: input.context ?? null,
      });
      return row.id;
    } catch (e) {
      this.log.error(
        `could not enqueue ${input.templateKey} for ${input.to}: ${errorMessage(e)}`
      );
      return null;
    }
  }

  // Every minute. The queue is normally empty, so this is one indexed query
  // against a partial index most of the time.
  @Cron(CronExpression.EVERY_MINUTE, { name: "email-outbox-drain" })
  async drainScheduled(): Promise<void> {
    await this.drainOnce();
  }

  // Public so an admin endpoint can flush the queue without waiting a minute.
  async drainOnce(): Promise<{ sent: number; retried: number; failed: number }> {
    const result = { sent: 0, retried: 0, failed: 0 };
    if (this.draining) return result;
    this.draining = true;

    try {
      const due = await this.repo.claimDue({
        limit: DRAIN_BATCH_SIZE,
        leaseSeconds: CLAIM_LEASE_SECONDS,
      });
      if (due.length === 0) return result;

      for (const row of due) {
        // Sequential on purpose. The transport is a pooled connection with
        // maxConnections: 3, and our relay soft-rejects under burst. Pacing
        // through the queue one at a time is the behaviour we want.
        const outcome = await this.deliver(row.id, {
          templateKey: row.template_key,
          to: row.to_email,
          lang: row.lang,
          variables: row.variables,
          attempts: row.attempts,
        });
        result[outcome]++;
      }

      this.log.log(
        `email outbox drain: ${result.sent} sent, ${result.retried} retried, ${result.failed} failed`
      );
      return result;
    } catch (e) {
      this.log.error(`email outbox drain failed: ${errorMessage(e)}`);
      return result;
    } finally {
      this.draining = false;
    }
  }

  // ---- internals ----

  private async deliver(
    id: string,
    row: {
      templateKey: string;
      to: string;
      lang: EmailLang;
      variables: Record<string, string | number>;
      attempts: number;
    }
  ): Promise<"sent" | "retried" | "failed"> {
    try {
      const ok = await this.templates.sendByTemplate({
        templateKey: row.templateKey,
        to: row.to,
        lang: row.lang,
        variables: row.variables,
      });

      if (!ok) {
        // Template missing or inactive. Retryable on purpose: an admin who
        // disabled a template by mistake, or a deploy where the seed had not
        // landed yet, resolves within the retry window without losing mail.
        return this.recordFailure(id, row.attempts, "template not available", true);
      }

      await this.repo.markSent(id);
      return "sent";
    } catch (e) {
      return this.recordFailure(
        id,
        row.attempts,
        errorMessage(e),
        isTemporaryFailure(e)
      );
    }
  }

  private async recordFailure(
    id: string,
    attemptsBefore: number,
    error: string,
    temporary: boolean
  ): Promise<"retried" | "failed"> {
    const attemptsAfter = attemptsBefore + 1;

    if (!temporary) {
      await this.repo.markFailed({ id, error: `permanent: ${error}` });
      this.log.warn(`email ${id} permanently rejected: ${error}`);
      return "failed";
    }

    if (attemptsAfter >= MAX_ATTEMPTS) {
      await this.repo.markFailed({
        id,
        error: `gave up after ${attemptsAfter} attempts: ${error}`,
      });
      this.log.error(
        `email ${id} exhausted ${attemptsAfter} attempts, last error: ${error}`
      );
      return "failed";
    }

    // attemptsAfter is 1-based, BACKOFF_MINUTES is 0-based: the wait after the
    // nth attempt is BACKOFF_MINUTES[n - 1]. The ?? guards nothing reachable
    // (attemptsAfter < MAX_ATTEMPTS is already established above) but keeps the
    // index total rather than relying on that invariant holding forever.
    const delayMinutes =
      BACKOFF_MINUTES[attemptsAfter - 1] ??
      BACKOFF_MINUTES[BACKOFF_MINUTES.length - 1];

    await this.repo.markRetry({
      id,
      error,
      delaySeconds: delayMinutes * 60,
    });
    this.log.warn(
      `email ${id} deferred (attempt ${attemptsAfter}/${MAX_ATTEMPTS}, retry in ${delayMinutes}m): ${error}`
    );
    return "retried";
  }
}
