import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'app/users/users.module';
import { PrismaService } from 'app/prisma/prisma.service';
import { EmailService } from 'app/email/email.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, EmailService],
  imports: [UsersModule],
})
export class AuthModule {}
