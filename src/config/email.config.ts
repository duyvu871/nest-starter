import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  from:
    process.env.EMAIL_FROM ||
    `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
  templatesPath:
    process.env.EMAIL_TEMPLATES_PATH || 'src/module/email/templates',
}));
