import { registerAs } from '@nestjs/config';

// register the database config
export default registerAs('database', () => {
  // Use DATABASE_URL if provided, otherwise construct from individual components
  const databaseUrl = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'app'}?schema=${process.env.DB_SCHEMA || 'public'}`;
  
  return {
    url: databaseUrl,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'app',
    schema: process.env.DB_SCHEMA || 'public',
  };
});