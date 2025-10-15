// src/application/verification/verification.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../infra/redis/redis.service';
import * as argon2 from 'argon2';
import { randomInt } from 'node:crypto';
import Redis from 'ioredis';

export type VerificationOptions = {
    namespace: string;     // "email-verify" | "password-reset" | ...
    subject: string;       // email or userId
    ttlSec?: number;       // default 10 minutes
    maxAttempts?: number;  // maximum number of incorrect attempts
    length?: number;       // code length, default 6
    rateLimitWindowSec?: number; // time to block resending
    rateLimitMax?: number; // maximum number of codes in the window
};

export type GenerateResult = {
    code: string;          // returned for you to send email/SMS
    expiresAt: number;     // epoch milliseconds
};

@Injectable()
export class VerificationService {
    private readonly redis: Redis;

    constructor(private readonly redisService: RedisService) {
        this.redis = this.redisService.getClient();
    }

    private keyCode(ns: string, subject: string) {
        return `verify:${ns}:${subject}:code`;
    }
    private keyAttempts(ns: string, subject: string) {
        return `verify:${ns}:${subject}:attempts`;
    }
    private keyRate(ns: string, subject: string) {
        return `verify:${ns}:${subject}:rate`;
    }

    private randomNumeric(len: number) {
        let code = '';
        for (let i = 0; i < len; i++) {
            code += randomInt(0, 10).toString();
        }
        return code;
    }

    async generate(opts: VerificationOptions): Promise<GenerateResult> {
        const {
            namespace,
            subject,
            ttlSec = 600,
            maxAttempts = 5,
            length = 6,
            rateLimitWindowSec = 60,
            rateLimitMax = 3,
        } = opts;

        // rate-limit: increment counter in the window
        const rateKey = this.keyRate(namespace, subject);
        const current = await this.redis.incr(rateKey);
        if (current === 1) {
            await this.redis.expire(rateKey, rateLimitWindowSec);
        }
        if (current > rateLimitMax) {
            throw new Error('Too many requests. Please try again later.');
        }

        const code = this.randomNumeric(length);
        const hash = await argon2.hash(code);

        const codeKey = this.keyCode(namespace, subject);
        const attemptsKey = this.keyAttempts(namespace, subject);

        // Save hash + TTL (use multi for consistency)
        const multi = this.redis.multi();
        multi.set(codeKey, hash, 'EX', ttlSec);
        multi.set(attemptsKey, String(maxAttempts), 'EX', ttlSec);
        await multi.exec();

        return { code, expiresAt: Date.now() + ttlSec * 1000 };
    }

    /** verify without deleting code (so you can choose to consume after success) */
    async verify(opts: VerificationOptions & { code: string }): Promise<boolean> {
        const { namespace, subject, code } = opts;
        const codeKey = this.keyCode(namespace, subject);
        const attemptsKey = this.keyAttempts(namespace, subject);

        const [hash, attemptsStr] = await this.redis.mget(codeKey, attemptsKey);
        if (!hash) return false;

        const attempts = parseInt(attemptsStr ?? '0', 10);
        if (Number.isNaN(attempts) || attempts <= 0) {
            return false;
        }

        const ok = await argon2.verify(hash, code);
        if (!ok) {
            // decrease attempts
            await this.redis.decr(attemptsKey);
            return false;
        }
        return true;
    }

    /** consume: one-time use, delete code & attempts */
    async consume(opts: { namespace: string; subject: string }) {
        const codeKey = this.keyCode(opts.namespace, opts.subject);
        const attemptsKey = this.keyAttempts(opts.namespace, opts.subject);
        await this.redis.del(codeKey, attemptsKey);
    }

    /** helper: verify + consume when correct */
    async verifyAndConsume(
        opts: VerificationOptions & { code: string },
    ): Promise<boolean> {
        const ok = await this.verify(opts);
        if (ok) await this.consume(opts);
        return ok;
    }
}
