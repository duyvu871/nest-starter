import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}