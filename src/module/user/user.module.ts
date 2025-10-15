import { Module } from '@nestjs/common';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { PrismaService } from 'app/infra/prisma/prisma.service';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { AuthTokenService } from 'module/auth/service/auth-token.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, BcryptService, AuthTokenService],
  exports: [UsersService],
})
export class UsersModule {}
