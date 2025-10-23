import { Injectable } from '@nestjs/common';
import { RedisService } from 'infra/redis/redis.service';
import { randomBytes } from 'crypto';

/**
 * Service for managing verification sessions
 * Uses random session IDs instead of email as keys for security
 */
@Injectable()
export class VerificationSessionService {
  private readonly SESSION_PREFIX = 'vs'; // verification session
  private readonly SESSION_TTL = 15 * 60; // 15 minutes

  constructor(private readonly redisService: RedisService) {}

  /**
   * Create a new verification session
   * @param email User's email address
   * @returns Session ID (random, not email-based)
   */
  async createSession(email: string): Promise<string> {
    // Generate random session ID (looks like a session token)
    const sessionId = randomBytes(32).toString('hex');
    const key = `${this.SESSION_PREFIX}:${sessionId}`;

    // Store email in Redis with session ID as key
    await this.redisService.set(key, email, this.SESSION_TTL);

    return sessionId;
  }

  /**
   * Get email from session ID
   * @param sessionId Session ID from cookie
   * @returns Email address or null if not found/expired
   */
  async getEmail(sessionId: string): Promise<string | null> {
    const key = `${this.SESSION_PREFIX}:${sessionId}`;
    const email = await this.redisService.get(key);
    return email;
  }

  /**
   * Delete verification session
   * @param sessionId Session ID to delete
   */
  async deleteSession(sessionId: string): Promise<void> {
    const key = `${this.SESSION_PREFIX}:${sessionId}`;
    await this.redisService.del(key);
  }

  /**
   * Extend session TTL (for resend scenarios)
   * @param sessionId Session ID to extend
   */
  async extendSession(sessionId: string): Promise<void> {
    const key = `${this.SESSION_PREFIX}:${sessionId}`;
    await this.redisService.expire(key, this.SESSION_TTL);
  }
}
