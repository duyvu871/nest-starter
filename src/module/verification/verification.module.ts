import { Module } from '@nestjs/common';
import { RedisModule } from 'infra/redis/redis.module';
import { VerificationService } from './verification.service';

@Module({
  imports: [RedisModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
