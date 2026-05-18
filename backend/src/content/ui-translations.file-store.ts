import { Injectable, Logger } from "@nestjs/common";
import { promises as fs } from "fs";
import * as path from "path";
import type { Lang } from "./content.types";

// File-backed UI translation overrides. Replaces the previous DB-backed
// `ui_translations` table.
//
// Why a file:
//   - Overrides are small (dozens to low hundreds of keys), low-frequency
//     writes, and need no relational queries.
//   - Keeps the schema lean and lets us snapshot/diff overrides in source
//     control if we want to.
//   - The "merge over the static locale" workflow on the frontend is
//     unchanged — same payload shape from the API.
//
// File layout:
//   backend/locales/en.json   { "dashboard.welcome": "Hi", ... }
//   backend/locales/ru.json   { ... }
//   Both default to `{}` when the file is missing or empty.
//
// Concurrency:
//   Per-language in-memory mutex serialises read-modify-write cycles within
//   one process. Cross-process safety isn't a concern here — in our deployment
//   there's exactly one backend instance writing these files (single
//   container, single Node process). If we ever scale horizontally we'll need
//   to revisit this (advisory lock + atomic write, or move to a DB-backed
//   k/v).
//
// Path resolution:
//   We look in (in order):
//     1) $LOCALES_DIR if set (deployment opts to relocate the dir)
//     2) ./locales relative to process.cwd()
//     3) <module-dir>/../../locales (dev: run via ts-node from project root)
//   First existing dir wins.

interface OverridesMap {
  [key: string]: string;
}

interface PendingLock {
  promise: Promise<void>;
  resolve: () => void;
}

@Injectable()
export class UiTranslationsFileStore {
  private readonly log = new Logger(UiTranslationsFileStore.name);
  private readonly locks = new Map<Lang, PendingLock | null>();
  private resolvedDir: string | null = null;

  // Resolve and cache the locales directory.
  private async dir(): Promise<string> {
    if (this.resolvedDir) return this.resolvedDir;

    const candidates = [
      process.env.LOCALES_DIR,
      path.resolve(process.cwd(), "locales"),
      // Fallback when dist code lives in /app/dist and locales are at /app/locales:
      path.resolve(process.cwd(), "..", "locales"),
    ].filter((p): p is string => typeof p === "string" && p.length > 0);

    for (const c of candidates) {
      try {
        const stat = await fs.stat(c);
        if (stat.isDirectory()) {
          this.resolvedDir = c;
          this.log.log(`locales dir: ${c}`);
          return c;
        }
      } catch {
        // try next
      }
    }
    // Last resort: create the first candidate so writes don't fail.
    const fallback = candidates[0] ?? path.resolve(process.cwd(), "locales");
    await fs.mkdir(fallback, { recursive: true });
    this.resolvedDir = fallback;
    this.log.warn(`locales dir not found; created ${fallback}`);
    return fallback;
  }

  private fileFor(lang: Lang): Promise<string> {
    return this.dir().then((d) => path.join(d, `${lang}.json`));
  }

  // ── Locking ──────────────────────────────────────────────────────────
  // Tiny per-lang mutex. Callers `await acquire(lang)`, do their work, then
  // call release(). We expose a `withLock` helper so users don't forget the
  // release in error paths.
  private async acquire(lang: Lang): Promise<() => void> {
    // Wait for any current holder.
    // Loop because between the wait and the set we could lose to another
    // pending acquirer if we did this naively.
    while (this.locks.get(lang)) {
      await this.locks.get(lang)!.promise;
    }
    let resolveFn!: () => void;
    const promise = new Promise<void>((res) => {
      resolveFn = res;
    });
    this.locks.set(lang, { promise, resolve: resolveFn });
    return () => {
      const cur = this.locks.get(lang);
      this.locks.set(lang, null);
      cur?.resolve();
    };
  }

  private async withLock<T>(lang: Lang, fn: () => Promise<T>): Promise<T> {
    const release = await this.acquire(lang);
    try {
      return await fn();
    } finally {
      release();
    }
  }

  // ── Read / write helpers ─────────────────────────────────────────────

  // Read the whole map for one language. Missing/empty/invalid file → `{}`.
  // Invalid JSON is logged but does not throw — we don't want a single bad
  // edit (e.g. partial write) to bring down the whole locale endpoint.
  private async readMap(lang: Lang): Promise<OverridesMap> {
    const file = await this.fileFor(lang);
    let raw: string;
    try {
      raw = await fs.readFile(file, "utf8");
    } catch (e: unknown) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") return {};
      throw e;
    }
    const trimmed = raw.trim();
    if (trimmed === "") return {};
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        // Filter to (string → string) — drops anything weird that crept in.
        const out: OverridesMap = {};
        for (const [k, v] of Object.entries(
          parsed as Record<string, unknown>
        )) {
          if (typeof v === "string") out[k] = v;
        }
        return out;
      }
      this.log.warn(`${lang}.json is not a JSON object — treating as empty`);
      return {};
    } catch (e) {
      this.log.warn(
        `${lang}.json is invalid JSON — treating as empty: ${
          (e as Error).message
        }`
      );
      return {};
    }
  }

  // Write the map atomically: write to <file>.tmp, fsync, then rename. On
  // POSIX rename is atomic within a filesystem so readers never see a partial
  // file. Keys are sorted alphabetically so file diffs in source control are
  // stable across writes.
  private async writeMap(lang: Lang, map: OverridesMap): Promise<void> {
    const file = await this.fileFor(lang);
    const tmp = file + ".tmp";
    const sorted: OverridesMap = {};
    for (const k of Object.keys(map).sort()) sorted[k] = map[k];
    const body = JSON.stringify(sorted, null, 2) + "\n";
    const handle = await fs.open(tmp, "w");
    try {
      await handle.writeFile(body, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    await fs.rename(tmp, file);
  }

  // ── Public API (matches the old repository contract) ────────────────

  // Map of key → value for one language. Used by the public endpoint.
  async findByLang(lang: Lang): Promise<Record<string, string>> {
    return this.readMap(lang);
  }

  // Flat list of all overrides across both langs. Used by the admin page.
  // Returns rows with the same shape the old repo returned (minus created_at/
  // updated_at, since files don't carry per-key timestamps).
  async findAll(): Promise<Array<{ key: string; lang: Lang; value: string }>> {
    const [en, ru] = await Promise.all([
      this.readMap("en"),
      this.readMap("ru"),
    ]);
    const rows: Array<{ key: string; lang: Lang; value: string }> = [];
    for (const k of Object.keys(en).sort())
      rows.push({ key: k, lang: "en", value: en[k] });
    for (const k of Object.keys(ru).sort())
      rows.push({ key: k, lang: "ru", value: ru[k] });
    return rows;
  }

  // Upsert a single key → value. Returns the saved row.
  async upsert(input: {
    key: string;
    lang: Lang;
    value: string;
  }): Promise<{ key: string; lang: Lang; value: string }> {
    return this.withLock(input.lang, async () => {
      const map = await this.readMap(input.lang);
      map[input.key] = input.value;
      await this.writeMap(input.lang, map);
      return { key: input.key, lang: input.lang, value: input.value };
    });
  }

  // Delete one override. Returns true if a key was removed, false otherwise.
  async delete(key: string, lang: Lang): Promise<boolean> {
    return this.withLock(lang, async () => {
      const map = await this.readMap(lang);
      if (!(key in map)) return false;
      delete map[key];
      await this.writeMap(lang, map);
      return true;
    });
  }
}
