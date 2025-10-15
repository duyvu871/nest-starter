import { Module } from '@nestjs/common';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { CodeService } from 'common/helpers/code.util';
import { UsersModule } from 'module/user/user.module';
import { EmailService } from 'module/email/email.service';
import { PrismaService } from 'app/infra/prisma/prisma.service';
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
    EmailService,
    CodeService,
    AuthTokenService,
    BcryptService,
  ],
  imports: [UsersModule],
})
export class AuthModule {}
