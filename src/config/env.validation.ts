import { z } from 'zod';

// define the environment variables schema
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  // Database
  DATABASE_URL: z.string().url(),
});

// define the environment variables type
export type Env = z.infer<typeof envSchema>;

// validate the environment variables
export function validateEnv(input: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    // throw error to nestjs
    console.error('❌ Invalid environment variables:', issues);
    process.exit(1);
  }
  return parsed.data;
}
