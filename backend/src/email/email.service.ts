import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  from: string; // "Name <addr@domain>"
  // Optional HTML alternative. When present the message goes out multipart/
  // alternative: clients that render HTML show this, everything else (and
  // every plain-text preview pane) falls back to `text`. The text part is
  // never optional - a message with no plain-text alternative scores worse
  // with spam filters and is unreadable in text-only clients.
  html?: string | null;
}

// EMAIL_MODE controls behavior:
//   'smtp' - real send via nodemailer, requires SMTP_HOST + SMTP_PORT (+ optional auth)
//   'log'  - no send; the email is logged to the backend console. Use in dev / staging.
// Default is 'log' so a fresh checkout doesn't crash without SMTP config.
type EmailMode = "smtp" | "log";

@Injectable()
export class EmailService implements OnModuleDestroy {
  private readonly log = new Logger(EmailService.name);
  private readonly mode: EmailMode;
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const raw = (config.get<string>("EMAIL_MODE") ?? "log").toLowerCase();
    this.mode = raw === "smtp" ? "smtp" : "log";

    if (this.mode === "smtp") {
      this.transporter = this.buildTransporter();
    }
  }

  // True when real SMTP is wired; false in 'log' mode. Useful for status endpoints / tests.
  isRealProvider(): boolean {
    return this.mode === "smtp";
  }

  async send(input: SendEmailInput): Promise<void> {
    if (this.mode === "log" || !this.transporter) {
      this.log.log(
        `[LOG-EMAIL] from=${input.from} to=${input.to} subject="${input.subject}"` +
          `${input.html ? " (html alternative attached)" : ""}\n${input.text}`
      );
      return;
    }

    await this.transporter.sendMail({
      from: input.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      // Omitted entirely when null so nodemailer keeps the message
      // text/plain rather than building a single-part HTML message.
      ...(input.html ? { html: input.html } : {}),
    });
  }

  // Cleanly close the SMTP connection pool on shutdown so the process can exit.
  onModuleDestroy(): void {
    if (this.transporter) {
      this.transporter.close();
    }
  }

  // ---- internals ----

  private buildTransporter(): nodemailer.Transporter {
    const host = this.config.getOrThrow<string>("SMTP_HOST");
    const port = parseInt(this.config.getOrThrow<string>("SMTP_PORT"), 10);

    // 'secure' = use implicit TLS from the start (standard on port 465).
    // For 587 ('submission') and 25, nodemailer will upgrade via STARTTLS if the server offers it.
    // Honour an explicit SMTP_SECURE override, else infer from port.
    const secureRaw = this.config.get<string>("SMTP_SECURE");
    const secure =
      secureRaw === undefined ? port === 465 : secureRaw === "true";

    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");

    // TLS verification on by default. Disable explicitly for self-signed certs.
    const rejectUnauthorized =
      (this.config.get<string>("SMTP_TLS_REJECT_UNAUTHORIZED") ?? "true") !==
      "false";

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
      tls: { rejectUnauthorized },
      // Pool connections so repeated sends reuse the same TCP/TLS connection.
      // Reasonable defaults for an MVP; tune if you ever blast emails.
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
  }
}
