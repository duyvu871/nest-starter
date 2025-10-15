import { registerAs } from '@nestjs/config';
import { BullRootModuleOptions } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export const bullConfig = (config: ConfigService): BullRootModuleOptions => ({
  connection: {
    host: config.get<string>('REDIS_HOST', 'localhost'),
    port: config.get<number>('REDIS_PORT', 6379),
    password: config.get<string>('REDIS_PASSWORD', ''),
  },
  // default job options
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    // Keep completed jobs for 1 hour, failed jobs for 24 hours
    removeOnComplete: { age: 3600 }, // 1 hour in seconds
    removeOnFail: { age: 86400 }, // 24 hours in seconds
  },
  // additional options
  prefix: 'bullmq',
});

export default registerAs('bull', () => ({
  // This is just a placeholder for config validation
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || '',
}));
