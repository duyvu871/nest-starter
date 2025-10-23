// core
import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
 import { NestExpressApplication } from '@nestjs/platform-express';
// app
import { AppModule } from 'app/app.module';
import { appConfig } from 'app/config';
// common
import { ResponseInterceptor } from 'common/interceptors/response.interceptor';
import { AllExceptionsFilter } from 'common/filters/all-exceptions.filter';
import { HttpLogInterceptor } from 'common/interceptors/http-logger.interceptor';
// external
import * as fs from 'fs';
import * as path from 'path';
import cookieParser from 'cookie-parser';
import * as exphbs from 'express-handlebars';

// import helpers
import hbs from "common/helpers/hbs.helper";

// bootstrap the application
async function bootstrap() {
  // Ensure logs directory exists
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true, // Buffer logs until logger is set up
    });

    // Get app config
    const appCfg = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
    // Set cookie parser
    app.use(cookieParser());
    // Set global prefix for the api
    app.setGlobalPrefix('api/v1', {
      exclude: [
        { path: 'docs', method: RequestMethod.ALL },
        { path: 'docs/*path', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL },
        { path: 'health/*path', method: RequestMethod.ALL },
        // Exclude page paths
        { path: '', method: RequestMethod.GET },
        { path: 'login', method: RequestMethod.ALL }, // Include POST for form submission
        { path: 'register', method: RequestMethod.ALL }, // Include POST for form submission
        { path: 'verify', method: RequestMethod.ALL }, // Include POST for verification
        { path: 'resend-verification', method: RequestMethod.ALL }, // Include POST for resend verification
        { path: 'runner/*path', method: RequestMethod.GET },
        { path: 'report/*path', method: RequestMethod.GET },
      ],
    });

    // Set Handlebars as the view engine with layouts support
    app.setBaseViewsDir(path.join(process.cwd(), 'views')); // Directory for your .hbs templates
    app.engine('hbs', exphbs.engine({
      extname: 'hbs',
      defaultLayout: 'main',
      layoutsDir: path.join(process.cwd(), 'views', 'layouts'),
      partialsDir: path.join(process.cwd(), 'views', 'partials'),
      helpers: {
        ...hbs, // Spread the imported helpers here
      },
    }));
    app.setViewEngine('hbs');

    // Apply global pipes, interceptors, and filters in the correct order

    // 1. First apply the HTTP logger interceptor to log all requests
    app.useGlobalInterceptors(app.get(HttpLogInterceptor));

    // 2. Apply validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // remove extra properties from the request body
        transform: true, // transform the request body to the DTO
        forbidNonWhitelisted: true, // throw an error if there are extra properties in the request body
        transformOptions: {
          enableImplicitConversion: true, // convert the request body to the DTO
        },
      }),
    );

    // 3. Apply response interceptor
    app.useGlobalInterceptors(app.get(ResponseInterceptor));

    // 4. Apply exception filter last
    app.useGlobalFilters(app.get(AllExceptionsFilter));

    // Start the application
    const port = appCfg.port;
    await app.listen(port);

    console.log(`Server ${appCfg.name} running on http://localhost:${port}`);
    return app;
  } catch (error) {
    console.error('Failed to start application', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Add proper promise handling
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
