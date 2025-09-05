import { Module } from '@nestjs/common';
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const isProd = process.env.NODE_ENV === 'production';

const consoleTransport = new winston.transports.Console({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    // Log ra console kiểu NestJS (màu sắc, context)
    nestWinstonModuleUtilities.format.nestLike('MyApp', {
      colors: !isProd,
      prettyPrint: !isProd,
    }),
  ),
});

const errorFileRotate = new (winston.transports as any).DailyRotateFile({
  level: 'error',
  dirname: 'logs',
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
});

const combinedFileRotate = new (winston.transports as any).DailyRotateFile({
  level: process.env.FILE_LOG_LEVEL || 'info',
  dirname: 'logs',
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.json(),
  ),
});

@Module({
  imports: [
    WinstonModule.forRoot({
      // Có thể set defaultMeta để gắn app/version, env...
      transports: [consoleTransport, errorFileRotate, combinedFileRotate],
      exitOnError: false,
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
