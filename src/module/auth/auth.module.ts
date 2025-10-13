import { Module } from '@nestjs/common';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { CodeService } from 'common/helpers/code.util';
import { UsersModule } from 'module/user/user.module';
import { EmailService } from 'module/email/email.service';
import { PrismaService } from 'app/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    EmailService,
    CodeService,
    TokenService,
    BcryptService,
  ],
  imports: [UsersModule],
})
export class AuthModule {}
