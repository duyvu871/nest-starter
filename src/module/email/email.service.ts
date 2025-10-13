import { Injectable, Logger, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  templatesPath: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

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
  }
  private renderTemplate(templateName: string, context: any) {
    const templatePath = path.join(
      process.cwd(),
      this.emailConfig.templatesPath,
      `${templateName}.hbs`,
    );
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = Handlebars.compile(templateSource);
    return compiledTemplate(context);
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      await this.transporter.sendMail({
        from: this.emailConfig.from,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Email sent to ${to} with subject "${subject}"`);
    } catch (err) {
      this.logger.error(` Failed to send email to ${to}: ${err.message}`);
      throw err;
    }
  }

  async sendVerificationEmail(to: string, code: string, ttl: Date) {
    const html = this.renderTemplate('verification', { code, ttl });
    return this.sendMail(to, 'Verify your email', '', html);
  }

  async sendForgotPasswordEmail(to: string, code: string, ttl: Date) {
    const html = this.renderTemplate('forgot-password', { code, ttl });
    return this.sendMail(to, 'Reset your password', '', html);
  }
}
