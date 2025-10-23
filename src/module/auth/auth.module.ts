import { Module } from '@nestjs/common';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { CodeService } from 'common/helpers/code.util';
import { UsersModule } from 'module/user/user.module';
import { EmailModule } from 'module/email/email.module';
import { PrismaService } from 'app/infra/prisma/prisma.service';
import { VerificationModule } from 'module/verification/verification.module';
import { RedisModule } from 'app/infra/redis/redis.module';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { LoginUserUseCase } from './use-cases/login-user.usecase';
import { VerifyAccountUseCase } from './use-cases/verify-account.usecase';
import { ResendVerificationUseCase } from './use-cases/resend-verification.usecase';
import { AuthTokenService } from './service/auth-token.service';
import { VerificationSessionService } from './service/verification-session.service';

@Module({
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    VerifyAccountUseCase,
    ResendVerificationUseCase,
    PrismaService,
    CodeService,
    AuthTokenService,
    VerificationSessionService,
    BcryptService,
  ],
  imports: [UsersModule, EmailModule, VerificationModule, RedisModule],
  exports: [
    RegisterUserUseCase,
    LoginUserUseCase,
    VerifyAccountUseCase,
    ResendVerificationUseCase,
    AuthTokenService,
    VerificationSessionService,
  ],
})
export class AuthModule {}
