import { registerAs } from '@nestjs/config';

// register the database config
export default registerAs('database', () => ({
  url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/app?schema=public',
}));
