import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';

// config
import {
  appConfig,
  databaseConfig,
  emailConfig,
  jobsConfig,
  jwtConfig,
  rateLimitConfig,
  bullConfig,
  bullConfigFactory,
  validateEnv,
} from './config';

// common
import { LoggerCoreModule, LoggerModule } from './common/logger';
import { HttpLogInterceptor } from './common/interceptors/http-logger.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// modules
import { PrismaModule } from './infra/prisma/prisma.module';
import { RedisModule } from './infra/redis/redis.module';
import { JobsModule } from './module/jobs/jobs.module';
import { AuthModule } from './module/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuthTokenService } from './module/auth/service/auth-token.service';
import { HealthModule } from './module/health/health.module';

@Module({
  imports: [
    ServeStaticModule.forRoot(
      // uploads assets
      {
        rootPath: join(process.cwd(), 'uploads'),
        serveRoot: '/uploads', // http://host/uploads/...
        serveStaticOptions: {
          index: false,
          setHeaders: (res) => {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
          },
        },
      },
      // public assets
      {
        rootPath: join(process.cwd(), 'public'),
        serveRoot: '/assets', // http://host/public/...
      },
      // docs assets
      {
        rootPath: join(process.cwd(), 'public', 'docs'),
        serveRoot: '/docs/assets', // http://host/docs/assets/...
      },
    ),
    // config
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
      // validate with Zod
      validate: validateEnv, // use Zod to validate and type
      load: [
        appConfig,
        databaseConfig,
        emailConfig,
        jobsConfig,
        jwtConfig,
        rateLimitConfig,
        bullConfig,
      ],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: bullConfigFactory,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const throttlerConfig = config.get('throttler');
        return [
          {
            ttl: throttlerConfig.ttl * 1000, // Convert to milliseconds
            limit: throttlerConfig.limit,
          },
        ];
      },
    }),
    LoggerCoreModule,
    LoggerModule.forFeature(['HTTP', 'DATABASE', 'APP', 'EMAIL']),
    PrismaModule,
    RedisModule,
    AuthModule,
    ScheduleModule.forRoot(),
    JobsModule,
    HealthModule,
  ],
  providers: [
    AuthTokenService,
    HttpLogInterceptor,
    ResponseInterceptor,
    AllExceptionsFilter,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
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
