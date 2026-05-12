import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmailProvider, SendEmailInput } from './provider.interface';

// Uses Resend's REST API directly. Docs: https://resend.com/docs/api-reference/emails/send-email
// We bubble up errors so the caller (ReminderService) can decide whether to abort or continue.
@Injectable()
export class ResendEmailProvider implements EmailProvider {
  readonly name = 'resend' as const;

  constructor(private readonly config: ConfigService) {}

  async send(input: SendEmailInput): Promise<void> {
    const apiKey = this.config.getOrThrow<string>('RESEND_API_KEY');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: input.from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`resend ${res.status}: ${body.slice(0, 300)}`);
    }
  }
}
