// End-to-end exercise of the Click payment flow against a real Postgres.
//
// Purpose: prove the payment path works with fiscalization DISABLED, and that
// the callback state machine behaves under the conditions Click actually
// produces - replayed Prepare, duplicate Complete, tampered signature, wrong
// amount, cancellation.
//
// This is not a unit test suite. It constructs the real ClickService against
// real repositories and a real database, and stubs only SubscriptionsService
// (which drags in email templates and the users repo, none of which this flow
// depends on beyond "give me a subscription id"). The stub counts calls, so a
// double grant is a visible failure rather than a silent one.
//
// Run against an already-migrated database:
//   PGHOST=/path/to/pgdata npx ts-node test/click-payment-flow.ts

import postgres from "postgres";
import type { Sql } from "postgres";
import { createHash } from "node:crypto";
import { ClickConfig } from "../src/billing/click/click.config";
import { ClickOrdersRepository } from "../src/billing/click/click-orders.repository";
import { ClickService } from "../src/billing/click/click.service";
import { ClickFiscalService } from "../src/billing/click/click-fiscal.service";
import { ClickMerchantClient } from "../src/billing/click/click-merchant.client";
import { PlansRepository } from "../src/billing/plans.repository";
import { SubscriptionsRepository } from "../src/billing/subscriptions.repository";
import type { SubscriptionsService } from "../src/billing/subscriptions.service";
import type { ConfigService } from "@nestjs/config";

const SECRET = "test_secret_key";
const SERVICE_ID = "12345";
const MERCHANT_ID = "6789";

// ── harness ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function check(label: string, cond: boolean, detail?: unknown) {
  if (cond) {
    passed++;
    console.log(`  ok   ${label}`);
  } else {
    failed++;
    console.log(`  FAIL ${label}`, detail === undefined ? "" : detail);
  }
}

function eq(label: string, actual: unknown, expected: unknown) {
  check(label, actual === expected, `expected ${String(expected)}, got ${String(actual)}`);
}

// Signature builders mirroring what Click does on their side. Deliberately
// written independently of click.signature.ts so a bug there can't cancel out
// with a matching bug in the test.
function prepareSign(p: {
  click_trans_id: string;
  service_id: string;
  merchant_trans_id: string;
  amount: string;
  action: string;
  sign_time: string;
}): string {
  return createHash("md5")
    .update(
      p.click_trans_id +
        p.service_id +
        SECRET +
        p.merchant_trans_id +
        p.amount +
        p.action +
        p.sign_time,
      "utf8"
    )
    .digest("hex");
}

function completeSign(p: {
  click_trans_id: string;
  service_id: string;
  merchant_trans_id: string;
  merchant_prepare_id: string;
  amount: string;
  action: string;
  sign_time: string;
}): string {
  return createHash("md5")
    .update(
      p.click_trans_id +
        p.service_id +
        SECRET +
        p.merchant_trans_id +
        p.merchant_prepare_id +
        p.amount +
        p.action +
        p.sign_time,
      "utf8"
    )
    .digest("hex");
}

const SIGN_TIME = "2026-07-24 12:00:00";

// ── wiring ─────────────────────────────────────────────────────────────────

// FISCALIZATION IS OFF here - the whole point of the run.
const ENV: Record<string, string> = {
  CLICK_ENABLED: "true",
  CLICK_MERCHANT_ID: MERCHANT_ID,
  CLICK_SERVICE_ID: SERVICE_ID,
  CLICK_SECRET_KEY: SECRET,
  CLICK_MERCHANT_USER_ID: "4242",
  CLICK_FISCAL_ENABLED: "false",
  APP_PUBLIC_URL: "https://finshark.uz",
};

const fakeConfigService = {
  get: (key: string) => ENV[key],
} as unknown as ConfigService;

async function main() {
  const host = process.env.PGHOST ?? "/home/claude/pgdata";
  // postgres.js needs object config for a unix-socket server; a URI with a
  // ?host= query string does not round-trip.
  const sql: Sql = postgres({
    host,
    database: "postgres",
    username: "postgres",
  });

  const config = new ClickConfig(fakeConfigService);
  const orders = new ClickOrdersRepository(sql);
  const plans = new PlansRepository(sql);
  const subsRepo = new SubscriptionsRepository(sql);
  const merchant = new ClickMerchantClient(config);
  const fiscal = new ClickFiscalService(config, orders, plans, merchant);

  // Stub grant: inserts a real subscription row (so the FK on
  // click_orders.subscription_id is satisfied) and counts invocations.
  let grantCalls = 0;
  const grantedStartsAt: Date[] = [];
  const subscriptions = {
    grant: async (input: { userId: string; planId: string; startsAt?: Date }) => {
      grantCalls++;
      grantedStartsAt.push(input.startsAt ?? new Date());
      const rows = await sql<{ id: string }[]>`
        INSERT INTO subscriptions (user_id, plan_id, source, starts_at, ends_at)
        VALUES (${input.userId}, ${input.planId}, 'click',
                ${input.startsAt ?? new Date()},
                ${new Date(Date.now() + 30 * 86400000)})
        RETURNING id
      `;
      return { id: rows[0].id };
    },
    revoke: async () => ({}),
  } as unknown as SubscriptionsService;

  const service = new ClickService(
    sql,
    config,
    orders,
    plans,
    subsRepo,
    subscriptions,
    fiscal
  );

  const userRows = await sql<{ id: string }[]>`SELECT id FROM users LIMIT 1`;
  const userId = userRows[0].id;

  // Clean slate for repeat runs.
  await sql`DELETE FROM click_callback_log`;
  await sql`DELETE FROM click_orders`;
  await sql`DELETE FROM subscriptions`;

  console.log("\n[1] config: payments configured, fiscalization off");
  eq("isConfigured", config.isConfigured(), true);
  eq("configProblem", config.configProblem(), null);
  eq("fiscalEnabled", config.fiscalEnabled, false);
  eq("fiscal config", config.fiscal, null);

  console.log("\n[2] create order");
  const handle = await service.createOrder({
    userId,
    planId: "premium_monthly",
  });
  eq("amount formatted N.NN", handle.amount, "49000.00");
  eq("amount_minor", handle.amount_minor, 4900000);
  eq("merchant_id passed through", handle.merchant_id, MERCHANT_ID);
  check(
    "pay_url points at my.click.uz",
    handle.pay_url.startsWith("https://my.click.uz/services/pay/?"),
    handle.pay_url
  );
  check(
    "pay_url carries return_url",
    handle.pay_url.includes(
      encodeURIComponent(`https://finshark.uz/subscription/click/return?order=${handle.order_id}`)
    ),
    handle.pay_url
  );
  const created = await orders.findById(handle.order_id);
  eq("status created", created?.status, "created");
  eq(
    "fiscal_status not_required when fiscalization is off",
    created?.fiscal_status,
    "not_required"
  );

  const mti = handle.merchant_trans_id;
  const clickTransId = "900000001";
  const paydocId = "800000001";
  const amount = handle.amount;

  console.log("\n[3] prepare: tampered signature is rejected");
  const badPrepare = await service.handlePrepare({
    click_trans_id: clickTransId,
    service_id: SERVICE_ID,
    click_paydoc_id: paydocId,
    merchant_trans_id: mti,
    amount,
    action: "0",
    error: "0",
    sign_time: SIGN_TIME,
    sign_string: "0".repeat(32),
  });
  eq("error -1 SIGN CHECK FAILED", badPrepare.response.error, -1);
  eq("verdict", badPrepare.verdict, "bad_sign");
  eq("no state change", (await orders.findById(handle.order_id))?.status, "created");

  console.log("\n[4] prepare: wrong amount is rejected");
  const wrongAmount = "1000.00";
  const badAmount = await service.handlePrepare({
    click_trans_id: clickTransId,
    service_id: SERVICE_ID,
    click_paydoc_id: paydocId,
    merchant_trans_id: mti,
    amount: wrongAmount,
    action: "0",
    error: "0",
    sign_time: SIGN_TIME,
    sign_string: prepareSign({
      click_trans_id: clickTransId,
      service_id: SERVICE_ID,
      merchant_trans_id: mti,
      amount: wrongAmount,
      action: "0",
      sign_time: SIGN_TIME,
    }),
  });
  eq("error -2 Incorrect parameter amount", badAmount.response.error, -2);
  eq("verdict", badAmount.verdict, "amount_mismatch");

  console.log("\n[5] prepare: valid");
  const prepareBody = {
    click_trans_id: clickTransId,
    service_id: SERVICE_ID,
    click_paydoc_id: paydocId,
    merchant_trans_id: mti,
    amount,
    action: "0",
    error: "0",
    sign_time: SIGN_TIME,
    sign_string: prepareSign({
      click_trans_id: clickTransId,
      service_id: SERVICE_ID,
      merchant_trans_id: mti,
      amount,
      action: "0",
      sign_time: SIGN_TIME,
    }),
  };
  const prepared = await service.handlePrepare(prepareBody);
  eq("error 0", prepared.response.error, 0);
  const prepareId = (prepared.response as { merchant_prepare_id: number })
    .merchant_prepare_id;
  check("merchant_prepare_id issued", Number.isFinite(prepareId) && prepareId > 0, prepareId);
  eq("status prepared", (await orders.findById(handle.order_id))?.status, "prepared");

  console.log("\n[6] prepare replay returns the SAME merchant_prepare_id");
  const replay = await service.handlePrepare(prepareBody);
  eq("error 0", replay.response.error, 0);
  eq("verdict", replay.verdict, "prepare_replay");
  eq(
    "same prepare id",
    (replay.response as { merchant_prepare_id: number }).merchant_prepare_id,
    prepareId
  );

  console.log("\n[7] complete: valid -> grants exactly once");
  const completeBody = {
    click_trans_id: clickTransId,
    service_id: SERVICE_ID,
    click_paydoc_id: paydocId,
    merchant_trans_id: mti,
    merchant_prepare_id: String(prepareId),
    amount,
    action: "1",
    error: "0",
    sign_time: SIGN_TIME,
    sign_string: completeSign({
      click_trans_id: clickTransId,
      service_id: SERVICE_ID,
      merchant_trans_id: mti,
      merchant_prepare_id: String(prepareId),
      amount,
      action: "1",
      sign_time: SIGN_TIME,
    }),
  };
  const completed = await service.handleComplete(completeBody);
  eq("error 0", completed.response.error, 0);
  eq("verdict", completed.verdict, "paid");
  eq("grant called once", grantCalls, 1);
  const paidOrder = await orders.findById(handle.order_id);
  eq("status paid", paidOrder?.status, "paid");
  check("subscription linked", paidOrder?.subscription_id !== null);
  check("paid_at set", paidOrder?.paid_at !== null);
  eq(
    "fiscal untouched with fiscalization off",
    paidOrder?.fiscal_status,
    "not_required"
  );
  eq("no fiscal attempts", paidOrder?.fiscal_attempts, 0);

  console.log("\n[8] complete replay -> ALREADY PAID, no second grant");
  const dupe = await service.handleComplete(completeBody);
  eq("error -4 Already paid", dupe.response.error, -4);
  eq("grant still called once", grantCalls, 1);

  console.log("\n[9] concurrent completes on a fresh order -> one grant only");
  const h2 = await service.createOrder({ userId, planId: "premium_monthly" });
  const ct2 = "900000002";
  const p2 = await service.handlePrepare({
    click_trans_id: ct2,
    service_id: SERVICE_ID,
    click_paydoc_id: "800000002",
    merchant_trans_id: h2.merchant_trans_id,
    amount: h2.amount,
    action: "0",
    error: "0",
    sign_time: SIGN_TIME,
    sign_string: prepareSign({
      click_trans_id: ct2,
      service_id: SERVICE_ID,
      merchant_trans_id: h2.merchant_trans_id,
      amount: h2.amount,
      action: "0",
      sign_time: SIGN_TIME,
    }),
  });
  const pid2 = String(
    (p2.response as { merchant_prepare_id: number }).merchant_prepare_id
  );
  const body2 = {
    click_trans_id: ct2,
    service_id: SERVICE_ID,
    click_paydoc_id: "800000002",
    merchant_trans_id: h2.merchant_trans_id,
    merchant_prepare_id: pid2,
    amount: h2.amount,
    action: "1",
    error: "0",
    sign_time: SIGN_TIME,
    sign_string: completeSign({
      click_trans_id: ct2,
      service_id: SERVICE_ID,
      merchant_trans_id: h2.merchant_trans_id,
      merchant_prepare_id: pid2,
      amount: h2.amount,
      action: "1",
      sign_time: SIGN_TIME,
    }),
  };
  const before = grantCalls;
  const [r1, r2] = await Promise.all([
    service.handleComplete(body2),
    service.handleComplete(body2),
  ]);
  eq("exactly one new grant under concurrency", grantCalls - before, 1);
  const codes = [r1.response.error, r2.response.error].sort((a, b) => a - b);
  check(
    "one accepted (0), one rejected as already paid (-4)",
    codes[0] === -4 && codes[1] === 0,
    codes
  );

  console.log("\n[10] chained grant: second purchase starts at the first's end");
  check(
    "second grant startsAt is in the future (queued, not overlapping)",
    grantedStartsAt[1] > new Date(Date.now() + 86400000),
    grantedStartsAt[1]
  );

  console.log("\n[11] complete with error<0 -> order cancelled, no grant");
  const h3 = await service.createOrder({ userId, planId: "premium_yearly" });
  const ct3 = "900000003";
  const p3 = await service.handlePrepare({
    click_trans_id: ct3,
    service_id: SERVICE_ID,
    click_paydoc_id: "800000003",
    merchant_trans_id: h3.merchant_trans_id,
    amount: h3.amount,
    action: "0",
    error: "0",
    sign_time: SIGN_TIME,
    sign_string: prepareSign({
      click_trans_id: ct3,
      service_id: SERVICE_ID,
      merchant_trans_id: h3.merchant_trans_id,
      amount: h3.amount,
      action: "0",
      sign_time: SIGN_TIME,
    }),
  });
  const pid3 = String(
    (p3.response as { merchant_prepare_id: number }).merchant_prepare_id
  );
  const grantsBeforeCancel = grantCalls;
  const cancelled = await service.handleComplete({
    click_trans_id: ct3,
    service_id: SERVICE_ID,
    click_paydoc_id: "800000003",
    merchant_trans_id: h3.merchant_trans_id,
    merchant_prepare_id: pid3,
    amount: h3.amount,
    action: "1",
    error: "-5001",
    error_note: "Insufficient funds",
    sign_time: SIGN_TIME,
    sign_string: completeSign({
      click_trans_id: ct3,
      service_id: SERVICE_ID,
      merchant_trans_id: h3.merchant_trans_id,
      merchant_prepare_id: pid3,
      amount: h3.amount,
      action: "1",
      sign_time: SIGN_TIME,
    }),
  });
  eq("error -9 Transaction cancelled", cancelled.response.error, -9);
  eq("no grant", grantCalls, grantsBeforeCancel);
  const o3 = await orders.findById(h3.order_id);
  eq("status cancelled", o3?.status, "cancelled");
  eq("click error recorded", o3?.error_code, -5001);

  console.log("\n[12] unknown merchant_trans_id -> -6");
  const unknown = await service.handlePrepare({
    click_trans_id: "999",
    service_id: SERVICE_ID,
    click_paydoc_id: "999",
    merchant_trans_id: "fsdoesnotexist",
    amount: "1000.00",
    action: "0",
    error: "0",
    sign_time: SIGN_TIME,
    sign_string: prepareSign({
      click_trans_id: "999",
      service_id: SERVICE_ID,
      merchant_trans_id: "fsdoesnotexist",
      amount: "1000.00",
      action: "0",
      sign_time: SIGN_TIME,
    }),
  });
  eq("error -6 Transaction does not exist", unknown.response.error, -6);

  console.log("\n[13] lifetime holder is refused before any payment surface opens");
  await sql`
    INSERT INTO subscriptions (user_id, plan_id, source, starts_at, ends_at)
    VALUES (${userId}, 'premium_lifetime', 'manual', NOW(), NULL)
  `;
  let refused = false;
  try {
    await service.createOrder({ userId, planId: "premium_monthly" });
  } catch (e) {
    refused = true;
    check(
      "409 Conflict",
      (e as { status?: number }).status === 409,
      (e as { status?: number }).status
    );
  }
  check("order creation refused", refused);

  console.log(`\n${passed} passed, ${failed} failed`);
  await sql.end();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
