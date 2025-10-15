import { z } from 'zod';

// define the environment variables schema
export const envSchema = z.object({
  // Environment
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  // Application
  APP_NAME: z.string().default('nest-basic-prisma'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('app'),
  DB_SCHEMA: z.string().default('public'),

  // Database URL (will be validated but can be constructed from above)
  DATABASE_URL: z.string().url(),

  // Docker Database Config (optional, used by docker-compose)
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),

  // Docker Ports (optional, used by docker-compose)
  DEV_DB_PORT: z.coerce.number().int().min(1).max(65535).optional(),
  PROD_DB_PORT: z.coerce.number().int().min(1).max(65535).optional(),

  // Jobs
  TZ: z.string().default('Asia/Ho_Chi_Minh'),
  EXAMPLE_CRON: z.string().default('0 2 * * *'), // every day at 2:00 AM

  // Health Check Configuration
  HEALTH_ENDPOINTS_ENABLED: z.coerce.boolean().default(false),

  // Security & Monitoring
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('24h'),

  // Email Configuration
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string(),
  EMAIL_TEMPLATES_PATH: z.string().default('src/module/email/templates'),

  // Redis Configuration
  REDIS_URL: z.string().url(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
  REDIS_PASSWORD: z.string().default(''),

  // File Upload Configuration
  UPLOAD_DEST: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(10485760),

  // Logging Configuration
  LOG_LEVEL: z.string().default('info'),
  LOG_FILE_MAX_SIZE: z.string().default('10m'),
  LOG_FILE_MAX_FILES: z.coerce.number().int().positive().default(5),

  // Rate Limiting
  RATE_LIMIT_TTL: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  // CORS Configuration
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:4200'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().int().min(1).max(20).default(12),

  // Monitoring
  PROMETHEUS_ENABLED: z.coerce.boolean().default(false),
  METRICS_PORT: z.coerce.number().int().min(1).max(65535).default(9090),
});

// define the environment variables type
export type Env = z.infer<typeof envSchema>;

// validate the environment variables
export function validateEnv(input: Record<string, unknown>): Env {
  // Construct DATABASE_URL if not provided but individual components are
  if (
    !input.DATABASE_URL &&
    input.DB_USER &&
    input.DB_PASSWORD &&
    input.DB_HOST &&
    input.DB_PORT &&
    input.DB_NAME &&
    input.DB_SCHEMA
  ) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    input.DATABASE_URL = `postgresql://${input.DB_USER}:${input.DB_PASSWORD}@${input.DB_HOST}:${input.DB_PORT}/${input.DB_NAME}?schema=${input.DB_SCHEMA}`;
  }

  // Construct REDIS_URL if not provided but individual components are
  if (
    !input.REDIS_URL &&
    input.REDIS_HOST &&
    input.REDIS_PORT &&
    input.REDIS_PASSWORD
  ) {
    input.REDIS_URL = `redis://${input.REDIS_PASSWORD}@${input.REDIS_HOST}:${input.REDIS_PORT}`;
  }

  // Parse and validate
  const parsed = envSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    // throw error to nestjs
    console.error('❌ Invalid environment variables:', issues);
    process.exit(1);
  }
  return parsed.data;
}
