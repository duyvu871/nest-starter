import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';

// config
import { appConfig, databaseConfig, emailConfig, jobsConfig, jwtConfig, validateEnv } from './config';

// common
import { LoggerCoreModule, LoggerModule } from './common/logger';
import { HttpLogInterceptor } from './common/interceptors/http-logger.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// modules
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './module/jobs/jobs.module';
import { AuthModule } from './module/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TokenService } from './module/auth/token.service';
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
      load: [appConfig, databaseConfig, emailConfig, jobsConfig, jwtConfig],
    }),
    LoggerCoreModule,
    LoggerModule.forFeature(['HTTP', 'DATABASE', 'APP', 'EMAIL']),
    PrismaModule,
    AuthModule,
    ScheduleModule.forRoot(),
    JobsModule,
    HealthModule,
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
