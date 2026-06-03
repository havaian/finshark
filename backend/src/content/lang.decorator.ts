import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import {
  DEFAULT_LANG,
  SUPPORTED_LANGS,
  type Lang as LangType,
} from "./content.types";

// Resolve the language for the current request:
//   1) ?lang=xx query param wins (admin can preview by appending it)
//   2) X-Lang header (set by the frontend client based on user's chosen locale)
//   3) Accept-Language header (best-effort first-match against SUPPORTED_LANGS)
//   4) DEFAULT_LANG fallback
//
// Headers are case-insensitive in Express; query is exact-match.
export function resolveLangFromRequest(req: Request): LangType {
  const queryLang =
    typeof req.query.lang === "string" ? req.query.lang : undefined;
  if (isSupported(queryLang)) return queryLang;

  const headerLang = readHeader(req, "x-lang");
  if (isSupported(headerLang)) return headerLang;

  const accept = readHeader(req, "accept-language");
  if (accept) {
    // Parse "ru-RU,ru;q=0.9,en;q=0.8" → ["ru-RU", "ru", "en"].
    // We don't bother with quality weights for two languages.
    const parts = accept
      .split(",")
      .map((s) => s.trim().split(";")[0].toLowerCase());
    for (const p of parts) {
      const base = p.split("-")[0]; // ru-RU → ru
      if (isSupported(base)) return base;
    }
  }

  return DEFAULT_LANG;
}

function isSupported(value: string | undefined): value is LangType {
  return (
    typeof value === "string" &&
    (SUPPORTED_LANGS as readonly string[]).includes(value)
  );
}

function readHeader(req: Request, name: string): string | undefined {
  const v = req.headers[name];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

// @Lang() decorator - injects the resolved language as a method parameter.
//   listPapers(@Lang() lang: Lang) { ... }
export const Lang = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): LangType => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return resolveLangFromRequest(req);
  }
);
