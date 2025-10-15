import { Module } from '@nestjs/common';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { CodeService } from 'common/helpers/code.util';
import { UsersModule } from 'module/user/user.module';
import { EmailModule } from 'module/email/email.module';
import { PrismaService } from 'app/infra/prisma/prisma.service';
import { VerificationModule } from 'module/verification/verification.module';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { LoginUserUseCase } from './use-cases/login-user.usecase';
import { AuthTokenService } from './service/auth-token.service';

@Module({
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    PrismaService,
    CodeService,
    AuthTokenService,
    BcryptService,
  ],
  imports: [UsersModule, EmailModule, VerificationModule],
})
export class AuthModule {}
