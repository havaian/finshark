import { Injectable, Logger } from '@nestjs/common';
import type { EmailProvider, SendEmailInput } from './provider.interface';

@Injectable()
export class LogEmailProvider implements EmailProvider {
  readonly name = 'log' as const;
  private readonly log = new Logger(LogEmailProvider.name);

  async send(input: SendEmailInput): Promise<void> {
    this.log.log(
      `[LOG-EMAIL] from=${input.from} to=${input.to} subject="${input.subject}"\n${input.text}`,
    );
  }
}
