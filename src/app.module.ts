import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// modules
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { appConfig, databaseConfig, jobsConfig, validateEnv } from './config';
import { HttpLogInterceptor } from './common/interceptors/http-logger.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggerCoreModule, LoggerModule } from './common/logger';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { TokenService } from './auth/token.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
      // validate with Zod
      validate: validateEnv, // use Zod to validate and type
      load: [appConfig, databaseConfig, jobsConfig],
    }),
    LoggerCoreModule,
    LoggerModule.forFeature(['HTTP', 'DATABASE', 'APP']),
    PrismaModule,
    UsersModule,
    AuthModule,
    ScheduleModule.forRoot(),
    JobsModule,
  ],
  providers: [
    TokenService,
    HttpLogInterceptor,
    ResponseInterceptor,
    AllExceptionsFilter,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
