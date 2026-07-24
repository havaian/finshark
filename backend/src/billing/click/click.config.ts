import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// Central place that reads and validates every Click-related env var.
//
// Two independent switches:
//   CLICK_ENABLED        - the payment integration itself
//   CLICK_FISCAL_ENABLED - OFD receipt submission after a successful payment
//
// Fiscalization can be off while payments are on (e.g. while the accountant is
// still sourcing the MXIK code). In that state orders are marked
// fiscal_status='not_required' and no receipt is filed. Turning it on later
// only affects new orders - historical ones stay 'not_required' rather than
// being retroactively swept, because filing a receipt weeks after the fact is a
// decision for the accountant, not a background job.

export interface ClickCoreConfig {
  merchantId: string;
  serviceId: string;
  secretKey: string;
  merchantUserId: string;
}

export interface ClickFiscalConfig {
  // Exactly one of these is set; Click's CommissionInfo requires TIN or PINFL.
  tin: string | null;
  pinfl: string | null;
  spic: string;
  packageCode: string;
  vatPercent: number;
  priceIncludesVat: boolean;
  // Optional OFD unit code. Omitted from the payload when null.
  units: number | null;
}

const PAY_URL_BASE = "https://my.click.uz/services/pay/";
const CHECKOUT_JS_URL = "https://my.click.uz/pay/checkout.js";
const MERCHANT_API_BASE = "https://api.click.uz/v2/merchant";

@Injectable()
export class ClickConfig {
  private readonly log = new Logger(ClickConfig.name);

  constructor(private readonly config: ConfigService) {}

  // ── Core payment config ──────────────────────────────────────────────────

  get enabled(): boolean {
    return this.boolEnv("CLICK_ENABLED", false);
  }

  // Null when any required credential is missing. Callers treat null as "not
  // configured" and refuse to create orders rather than generating a pay URL
  // that would fail at Click's end with a confusing error.
  get core(): ClickCoreConfig | null {
    const merchantId = this.strEnv("CLICK_MERCHANT_ID");
    const serviceId = this.strEnv("CLICK_SERVICE_ID");
    const secretKey = this.strEnv("CLICK_SECRET_KEY");
    const merchantUserId = this.strEnv("CLICK_MERCHANT_USER_ID");
    if (!merchantId || !serviceId || !secretKey || !merchantUserId) {
      return null;
    }
    return { merchantId, serviceId, secretKey, merchantUserId };
  }

  // True when payments can actually be taken right now.
  isConfigured(): boolean {
    return this.enabled && this.core !== null;
  }

  // A one-line explanation for the admin panel when payments are unavailable.
  // Returns null when everything is fine.
  configProblem(): string | null {
    if (!this.enabled) return "CLICK_ENABLED is not true";
    const missing: string[] = [];
    if (!this.strEnv("CLICK_MERCHANT_ID")) missing.push("CLICK_MERCHANT_ID");
    if (!this.strEnv("CLICK_SERVICE_ID")) missing.push("CLICK_SERVICE_ID");
    if (!this.strEnv("CLICK_SECRET_KEY")) missing.push("CLICK_SECRET_KEY");
    if (!this.strEnv("CLICK_MERCHANT_USER_ID")) {
      missing.push("CLICK_MERCHANT_USER_ID");
    }
    return missing.length > 0 ? `missing: ${missing.join(", ")}` : null;
  }

  // ── Fiscalization config ─────────────────────────────────────────────────

  get fiscalEnabled(): boolean {
    return this.boolEnv("CLICK_FISCAL_ENABLED", false);
  }

  // Null when fiscalization is off OR incompletely configured. Deliberately
  // strict: a receipt filed with a guessed MXIK or a missing TIN is a tax
  // problem, so we file nothing rather than file something wrong.
  get fiscal(): ClickFiscalConfig | null {
    if (!this.fiscalEnabled) return null;

    const tin = this.strEnv("CLICK_FISCAL_TIN");
    const pinfl = this.strEnv("CLICK_FISCAL_PINFL");
    const spic = this.strEnv("CLICK_FISCAL_SPIC");
    const packageCode = this.strEnv("CLICK_FISCAL_PACKAGE_CODE");
    const vatRaw = this.strEnv("CLICK_FISCAL_VAT_PERCENT");
    const unitsRaw = this.strEnv("CLICK_FISCAL_UNITS");

    // CommissionInfo requires exactly one identifier. Both set is a config
    // mistake we refuse rather than silently pick one.
    if ((!tin && !pinfl) || (tin && pinfl)) return null;
    if (!spic || !packageCode) return null;

    const vatPercent = vatRaw === null ? NaN : Number(vatRaw);
    if (!Number.isFinite(vatPercent) || vatPercent < 0 || vatPercent > 100) {
      return null;
    }

    let units: number | null = null;
    if (unitsRaw !== null && unitsRaw !== "") {
      const n = Number(unitsRaw);
      units = Number.isFinite(n) ? n : null;
    }

    return {
      tin,
      pinfl,
      spic,
      packageCode,
      vatPercent,
      // Uzbek consumer pricing is VAT-inclusive by default. Only an explicit
      // 'false' flips it, so a missing var behaves the conservative way.
      priceIncludesVat: this.boolEnv("CLICK_FISCAL_PRICE_INCLUDES_VAT", true),
      units,
    };
  }

  // Explanation for the admin panel when fiscalization is enabled but unusable.
  fiscalConfigProblem(): string | null {
    if (!this.fiscalEnabled) return null;
    if (this.fiscal !== null) return null;

    const tin = this.strEnv("CLICK_FISCAL_TIN");
    const pinfl = this.strEnv("CLICK_FISCAL_PINFL");
    if (tin && pinfl) {
      return "set exactly one of CLICK_FISCAL_TIN / CLICK_FISCAL_PINFL, not both";
    }
    const missing: string[] = [];
    if (!tin && !pinfl) missing.push("CLICK_FISCAL_TIN or CLICK_FISCAL_PINFL");
    if (!this.strEnv("CLICK_FISCAL_SPIC")) missing.push("CLICK_FISCAL_SPIC");
    if (!this.strEnv("CLICK_FISCAL_PACKAGE_CODE")) {
      missing.push("CLICK_FISCAL_PACKAGE_CODE");
    }
    if (!this.strEnv("CLICK_FISCAL_VAT_PERCENT")) {
      missing.push("CLICK_FISCAL_VAT_PERCENT");
    }
    return missing.length > 0
      ? `missing: ${missing.join(", ")}`
      : "CLICK_FISCAL_VAT_PERCENT must be a number between 0 and 100";
  }

  // ── Endpoints ────────────────────────────────────────────────────────────

  get payUrlBase(): string {
    return PAY_URL_BASE;
  }

  get checkoutJsUrl(): string {
    return CHECKOUT_JS_URL;
  }

  get merchantApiBase(): string {
    return MERCHANT_API_BASE;
  }

  // Where Click sends the user back after a redirect payment. Built from
  // APP_PUBLIC_URL (already used for email links) so there's one source of
  // truth for the public frontend origin.
  returnUrlFor(orderId: string): string {
    const base = (
      this.config.get<string>("APP_PUBLIC_URL") ?? "http://localhost:5173"
    ).replace(/\/+$/, "");
    return `${base}/subscription/click/return?order=${encodeURIComponent(orderId)}`;
  }

  // ── env helpers ──────────────────────────────────────────────────────────

  // Trimmed value, or null for unset/blank. Blank-vs-unset is not a meaningful
  // distinction for any of these vars, and .env files routinely carry
  // `KEY=` placeholders.
  private strEnv(key: string): string | null {
    const raw = this.config.get<string>(key);
    if (raw === undefined || raw === null) return null;
    const trimmed = String(raw).trim();
    return trimmed === "" ? null : trimmed;
  }

  private boolEnv(key: string, fallback: boolean): boolean {
    const raw = this.strEnv(key);
    if (raw === null) return fallback;
    const lowered = raw.toLowerCase();
    if (lowered === "true" || lowered === "1" || lowered === "yes") return true;
    if (lowered === "false" || lowered === "0" || lowered === "no") return false;
    this.log.warn(`${key}="${raw}" is not a boolean; using ${fallback}`);
    return fallback;
  }
}
