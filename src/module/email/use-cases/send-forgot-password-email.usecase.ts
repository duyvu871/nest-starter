import { Injectable } from '@nestjs/common';
import { EmailService } from '../email.service';

export interface SendForgotPasswordEmailParams {
  to: string;
  code: string;
  ttl: Date;
}

@Injectable()
export class SendForgotPasswordEmailUseCase {
  constructor(private readonly emailService: EmailService) {}

  async execute(params: SendForgotPasswordEmailParams): Promise<void> {
    const { to, code, ttl } = params;
    const idempotencyKey = `forgot-password:${to}:${code}`;
    await this.emailService.sendJob({
      to,
      template: 'forgot-password',
      context: {
        code,
        ttl: ttl.toISOString(),
        subject: 'Reset your password',
      },
      idempotencyKey,
    });
  }
}
