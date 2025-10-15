import { Module } from '@nestjs/common';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { PrismaService } from 'app/infra/prisma/prisma.service';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, BcryptService],
  exports: [UsersService],
})
export class UsersModule {}
