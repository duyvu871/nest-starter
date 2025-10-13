import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));