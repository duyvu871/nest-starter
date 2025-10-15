import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface EmailJobData {
  to: string;
  subject?: string;
  text?: string;
  html?: string;
  template?: string;
  context?: Record<string, any>;
  // Idempotency key for deduplication
  idempotencyKey?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  async sendJob(data: EmailJobData): Promise<void> {
    try {
      await this.emailQueue.add('send-email', data);
      this.logger.log(`Email job queued for ${data.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to queue email for ${data.to}: ${error.message}`,
      );
      throw new Error(`Email queuing failed: ${error.message}`);
    }
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    const idempotencyKey = `email:${to}:${subject}`;
    await this.sendJob({
      to,
      subject,
      text,
      html,
      idempotencyKey,
    });
  }
}
