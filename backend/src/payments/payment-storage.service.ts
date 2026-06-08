import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { createReadStream, type ReadStream } from "node:fs";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

// Where payment slips live on disk. Files are written under
// <UPLOADS_DIR>/payment-slips/. UPLOADS_DIR defaults to ./uploads resolved
// against the process cwd (the backend dir in dev and in the prod container,
// per the Dockerfile WORKDIR). In prod this path is backed by a docker named
// volume so slips survive image rebuilds.
const SLIP_SUBDIR = "payment-slips";

// Accepted slip types - a transfer receipt is realistically a phone photo or a
// PDF from a banking app. Anything else is rejected at upload.
const ALLOWED_MIME = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

// Map mime -> file extension for the stored filename. We store with a sane
// extension so the file is openable if an admin downloads it directly off disk.
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
};

// 5 MB cap. A receipt photo / PDF is well under this; the limit stops someone
// filling the volume. Enforced here AND in the multer limits (controller) as
// defence in depth.
export const MAX_SLIP_BYTES = 5 * 1024 * 1024;

export interface StoredSlip {
  // Path relative to the uploads root (what we persist in the DB). Keeping it
  // relative means the absolute base can move (different host/volume) without
  // rewriting rows.
  relativePath: string;
  mime: string;
  size: number;
  originalName: string;
}

@Injectable()
export class PaymentStorageService {
  private readonly log = new Logger(PaymentStorageService.name);
  private readonly uploadsRoot: string;

  constructor(config: ConfigService) {
    const configured = config.get<string>("UPLOADS_DIR") ?? "./uploads";
    // Resolve to an absolute path once, against cwd. resolve() leaves absolute
    // inputs untouched and turns relative ones into absolute against cwd.
    this.uploadsRoot = isAbsolute(configured)
      ? configured
      : resolve(process.cwd(), configured);
  }

  // Validate + persist an uploaded slip. Throws BadRequestException on a
  // disallowed type or oversize file. Generates a random, collision-free
  // filename (UUID + extension) so user-supplied names can't traverse paths or
  // clash. The original name is returned for display only (never used on disk).
  async storeSlip(file: Express.Multer.File): Promise<StoredSlip> {
    if (!file || !file.buffer || file.size === 0) {
      throw new BadRequestException("payment slip file is required");
    }
    if (file.size > MAX_SLIP_BYTES) {
      throw new BadRequestException(
        `payment slip too large (max ${Math.floor(MAX_SLIP_BYTES / (1024 * 1024))} MB)`
      );
    }
    const mime = file.mimetype;
    if (!ALLOWED_MIME.has(mime)) {
      throw new BadRequestException(
        "payment slip must be an image (JPG, PNG, WebP, HEIC) or PDF"
      );
    }

    const ext = MIME_EXT[mime] ?? "bin";
    const filename = `${randomUUID()}.${ext}`;
    const dir = join(this.uploadsRoot, SLIP_SUBDIR);
    // recursive:true is a no-op if the dir already exists - safe to call every
    // upload, avoids a separate "ensure dir" lifecycle step.
    await mkdir(dir, { recursive: true });

    const absPath = join(dir, filename);
    await writeFile(absPath, file.buffer);

    return {
      relativePath: join(SLIP_SUBDIR, filename),
      mime,
      size: file.size,
      // Trim + cap the original name so a hostile/huge filename can't bloat the
      // row; it's display-only metadata.
      originalName: (file.originalname || "slip").slice(0, 200),
    };
  }

  // Open a stored slip for streaming back to an admin. Guards against path
  // traversal: the resolved absolute path MUST stay within uploadsRoot. Throws
  // NotFoundException if the file is missing or escapes the root.
  async openSlip(
    relativePath: string
  ): Promise<{ stream: ReadStream; size: number }> {
    const absPath = resolve(this.uploadsRoot, relativePath);
    // Containment check: the resolved path must start with the root + sep.
    const rootWithSep = this.uploadsRoot.endsWith("/")
      ? this.uploadsRoot
      : `${this.uploadsRoot}/`;
    if (absPath !== this.uploadsRoot && !absPath.startsWith(rootWithSep)) {
      this.log.warn(`refused slip path outside uploads root: ${relativePath}`);
      throw new NotFoundException("slip not found");
    }
    let size: number;
    try {
      const s = await stat(absPath);
      if (!s.isFile()) throw new Error("not a file");
      size = s.size;
    } catch {
      throw new NotFoundException("slip not found");
    }
    return { stream: createReadStream(absPath), size };
  }

  // Best-effort delete of a slip file from disk. Used when a submission is
  // removed. Never throws - a missing file is fine, and a delete failure
  // shouldn't block the DB operation that called it (we log and move on).
  async deleteSlip(relativePath: string): Promise<void> {
    try {
      const absPath = resolve(this.uploadsRoot, relativePath);
      const rootWithSep = this.uploadsRoot.endsWith("/")
        ? this.uploadsRoot
        : `${this.uploadsRoot}/`;
      if (absPath !== this.uploadsRoot && !absPath.startsWith(rootWithSep)) {
        return;
      }
      await unlink(absPath);
    } catch (e) {
      this.log.warn(
        `failed to delete slip ${relativePath}: ${(e as Error).message}`
      );
    }
  }
}
