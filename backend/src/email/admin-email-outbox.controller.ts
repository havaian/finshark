import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { EmailOutboxRepository } from "./email-outbox.repository";
import { EmailOutboxService } from "./email-outbox.service";
import { toPublicEmailOutboxEntry } from "./email-outbox.types";

// Read + repair surface for the transactional email queue.
//
// Without this the queue is invisible: a permanently-failed receipt shows up
// only as one ERROR line in the container log, which is exactly the blind spot
// that let a 451 go unnoticed in the first place. Being able to see "3 failed"
// at a glance is most of the value here.
//
// Deliberately narrow. No delete, no edit, no compose. The only write is a
// requeue, which puts a failed row back in the queue with its attempt counter
// reset - the action you want after fixing whatever the relay was unhappy
// about.
@Controller("admin/email-outbox")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminEmailOutboxController {
  constructor(
    private readonly repo: EmailOutboxRepository,
    private readonly outbox: EmailOutboxService
  ) {}

  // Counts by status. Cheap enough for the overview page to poll.
  @Get("stats")
  async stats() {
    return this.repo.countByStatus();
  }

  // Recent queue entries, newest first. `status=failed` narrows to the ones
  // that need a human.
  @Get()
  async list(
    @Query("status") status?: string,
    @Query("limit") limit?: string
  ) {
    const parsed = limit === undefined ? 100 : parseInt(limit, 10);
    const capped =
      Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 500) : 100;

    const rows =
      status === "failed"
        ? await this.repo.findFailed(capped)
        : await this.repo.findRecent(capped);

    return rows.map(toPublicEmailOutboxEntry);
  }

  @Get(":id")
  async get(@Param("id") id: string) {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException("outbox entry not found");
    return toPublicEmailOutboxEntry(row);
  }

  // Put a failed entry back in the queue. Only 'failed' rows are eligible -
  // requeuing something still pending would reset a backoff that is working
  // as intended.
  @Post(":id/requeue")
  @HttpCode(HttpStatus.OK)
  async requeue(@Param("id") id: string) {
    const row = await this.repo.requeue(id);
    if (!row) {
      throw new NotFoundException(
        "outbox entry not found, or not in 'failed' status"
      );
    }
    return toPublicEmailOutboxEntry(row);
  }

  // Run a drain immediately rather than waiting for the next minute tick.
  // Useful right after fixing a mail server: requeue the failures, hit this,
  // watch them clear.
  @Post("drain")
  @HttpCode(HttpStatus.OK)
  async drain() {
    return this.outbox.drainOnce();
  }
}
