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
