import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { SendEmailUseCase } from './use-cases/send-email.usecase';
import { SendVerificationEmailUseCase } from './use-cases/send-verification-email.usecase';
import { SendForgotPasswordEmailUseCase } from './use-cases/send-forgot-password-email.usecase';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [
    EmailService,
    SendEmailUseCase,
    SendVerificationEmailUseCase,
    SendForgotPasswordEmailUseCase,
  ],
  exports: [EmailService],
})
export class EmailModule {}
