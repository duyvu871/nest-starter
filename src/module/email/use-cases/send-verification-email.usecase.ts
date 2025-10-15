import { Injectable } from '@nestjs/common';
import { EmailService } from '../email.service';
import { BaseUseCase } from 'shared/interfaces/base-usecase.interface';

export interface SendVerificationEmailParams {
  to: string;
  code: string;
  ttl: number; // in milliseconds to convert to minutes
}

@Injectable()
export class SendVerificationEmailUseCase implements BaseUseCase<SendVerificationEmailParams, void> {
  constructor(private readonly emailService: EmailService) {}

  async execute(params: SendVerificationEmailParams): Promise<void> {
    const { to, code, ttl } = params;
    const idempotencyKey = `verification:${to}:${code}`;
    const ttlInMinutes = Math.floor(ttl / 60000);

    await this.emailService.sendJob({
      to,
      template: 'verification',
      context: {
        code,
        ttl: ttlInMinutes,
        subject: 'Verify your email to complete registration',
      },
      idempotencyKey,
    });
  }
}
