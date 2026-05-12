export interface SendEmailInput {
  to: string;             // recipient email
  subject: string;
  text: string;           // plain text body
  from: string;           // "Name <addr@domain>"
}

export interface EmailProvider {
  name: 'resend' | 'log';
  send(input: SendEmailInput): Promise<void>;
}
