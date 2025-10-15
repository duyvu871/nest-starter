import { Injectable, Logger, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { z } from 'zod';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  templatesPath: string;
}

const emailSchema = z.string().email();

@Injectable()
export class WorkerEmailService {
  private readonly logger = new Logger(WorkerEmailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly templateCache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(@Inject('email') private readonly emailConfig: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      host: this.emailConfig.host,
      port: this.emailConfig.port,
      secure: this.emailConfig.secure,
      auth: {
        user: this.emailConfig.user,
        pass: this.emailConfig.pass,
      },
    });

    // Verify transporter on initialization
    this.verifyTransporter();
  }

  private async verifyTransporter(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('Email transporter verified successfully');
    } catch (error) {
      this.logger.error(`Email transporter verification failed: ${error.message}`);
      throw new Error('Email transporter configuration is invalid');
    }
  }

  private getCompiledTemplate(templateName: string): HandlebarsTemplateDelegate {
    if (!this.templateCache.has(templateName)) {
      const templatePath = path.join(
        process.cwd(),
        this.emailConfig.templatesPath,
        `${templateName}.hbs`,
      );

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Email template '${templateName}' not found at ${templatePath}`);
      }

      const templateSource = fs.readFileSync(templatePath, 'utf8');
      this.templateCache.set(templateName, Handlebars.compile(templateSource));
    }
    return this.templateCache.get(templateName)!;
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    // Validate email
    emailSchema.parse(to);

    try {
      const result = await this.transporter.sendMail({
        from: this.emailConfig.from,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Email sent successfully to ${to} with messageId: ${result.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async sendTemplatedEmail(to: string, templateName: string, context: Record<string, any>): Promise<void> {
    // Validate email
    emailSchema.parse(to);

    try {
      const template = this.getCompiledTemplate(templateName);
      const html = template(context);

      // Generate subject from template or use default
      const subject = context.subject || `Message from ${this.emailConfig.from}`;

      await this.sendEmail(to, subject, '', html);
    } catch (error) {
      this.logger.error(`Failed to send templated email to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, code: string, ttl: Date): Promise<void> {
    await this.sendTemplatedEmail(to, 'verification', {
      code,
      ttl: ttl.toISOString(),
      subject: 'Verify your email',
    });
  }

  async sendForgotPasswordEmail(to: string, code: string, ttl: Date): Promise<void> {
    await this.sendTemplatedEmail(to, 'forgot-password', {
      code,
      ttl: ttl.toISOString(),
      subject: 'Reset your password',
    });
  }
}
