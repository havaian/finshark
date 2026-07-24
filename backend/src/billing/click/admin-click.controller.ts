import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminWith2faGuard } from "../../auth/guards/admin-with-2fa.guard";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ClickCallbackLogRepository } from "./click-callback-log.repository";
import { ClickConfig } from "./click.config";
import { ClickFiscalService } from "./click-fiscal.service";
import { ClickMerchantClient } from "./click-merchant.client";
import { ClickOrdersRepository } from "./click-orders.repository";
import { toAdminClickCallbackLog } from "./click.types";
import type { ClickOrderStatus } from "./click.types";

const VALID_STATUSES: ClickOrderStatus[] = [
  "created",
  "prepared",
  "paid",
  "cancelled",
  "failed",
];

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

// Admin surface for Click payments. Guarded identically to every other admin
// controller (JWT + elevated 2FA session).
@Controller("admin/click")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminClickController {
  constructor(
    private readonly orders: ClickOrdersRepository,
    private readonly callbackLog: ClickCallbackLogRepository,
    private readonly fiscal: ClickFiscalService,
    private readonly merchant: ClickMerchantClient,
    private readonly config: ClickConfig
  ) {}

  // Config health, so a misconfigured deployment is visible in the panel
  // instead of only in the logs. Never returns the secret key.
  @Get("health")
  async health() {
    return {
      payments_enabled: this.config.isConfigured(),
      payments_problem: this.config.configProblem(),
      fiscal_enabled: this.config.fiscalEnabled,
      fiscal_problem: this.config.fiscalConfigProblem(),
    };
  }

  // Order queue. ?status=created|prepared|paid|cancelled|failed filters.
  @Get("orders")
  async listOrders(
    @Query("status") status?: string,
    @Query("limit") limit?: string
  ) {
    const filter = VALID_STATUSES.includes(status as ClickOrderStatus)
      ? (status as ClickOrderStatus)
      : undefined;
    return this.orders.findForAdmin({
      status: filter,
      limit: parseLimit(limit),
    });
  }

  @Get("orders/:id")
  async getOrder(@Param("id") id: string) {
    const order = await this.orders.findOneForAdmin(id);
    if (!order) throw new NotFoundException("order not found");
    return order;
  }

  // The full callback trail for one order: what Click sent, what we answered,
  // and why. This is what gets pasted into a Click support ticket.
  @Get("orders/:id/callbacks")
  async orderCallbacks(@Param("id") id: string) {
    const order = await this.orders.findById(id);
    if (!order) throw new NotFoundException("order not found");
    const rows = await this.callbackLog.findByOrder(id);
    return rows.map(toAdminClickCallbackLog);
  }

  // Recent callbacks across all orders, including ones that never matched an
  // order (bad signature, unknown merchant_trans_id) - those have order_id
  // NULL and are invisible in the per-order view.
  @Get("callbacks")
  async recentCallbacks(@Query("limit") limit?: string) {
    const rows = await this.callbackLog.findRecent(parseLimit(limit));
    return rows.map(toAdminClickCallbackLog);
  }

  // Re-file a fiscal receipt that failed. Safe to press repeatedly: an order
  // already submitted is skipped rather than double-filed.
  @Post("orders/:id/fiscal-retry")
  async retryFiscal(@Param("id") id: string) {
    const order = await this.orders.findById(id);
    if (!order) throw new NotFoundException("order not found");
    const result = await this.fiscal.retryOne(id);
    return {
      ok: result.ok,
      fiscal_status: result.order?.fiscal_status ?? order.fiscal_status,
      fiscal_last_error: result.order?.fiscal_last_error ?? null,
      fiscal_qr_url: result.order?.fiscal_qr_url ?? null,
    };
  }

  // Ask Click directly what it thinks happened to a payment. For orders stuck
  // in 'created' or 'prepared' where the question is "did the money actually
  // move" - answers it without leaving the admin panel. Read-only: this does
  // NOT change our order state, because reconciling on a probe result rather
  // than a signed callback is exactly how double-grants happen.
  @Get("orders/:id/remote-status")
  async remoteStatus(@Param("id") id: string) {
    const order = await this.orders.findById(id);
    if (!order) throw new NotFoundException("order not found");
    const res = await this.merchant.getPaymentStatusByMerchantTransId(
      order.merchant_trans_id
    );
    return {
      ok: res.ok,
      http_status: res.status,
      error_code: res.errorCode,
      error_note: res.errorNote,
      data: res.data,
    };
  }
}

function parseLimit(raw?: string): number {
  const n = raw === undefined ? NaN : parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}
