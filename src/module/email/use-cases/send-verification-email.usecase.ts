import { Injectable } from '@nestjs/common';
import { EmailService } from '../email.service';

export interface SendVerificationEmailParams {
  to: string;
  code: string;
  ttl: Date;
}

@Injectable()
export class SendVerificationEmailUseCase {
  constructor(
    private readonly emailService: EmailService,
  ) {}

  async execute(params: SendVerificationEmailParams): Promise<void> {
    const { to, code, ttl } = params;
    const idempotencyKey = `verification:${to}:${code}`;
    await this.emailService.sendJob({
      to,
      template: 'verification',
      context: {
        code,
        ttl: ttl.toISOString(),
        subject: 'Verify your email',
      },
      idempotencyKey,
    });
  }
}