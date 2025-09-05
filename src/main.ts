// core
import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
// app
import { AppModule } from 'app/app.module';
import { appConfig } from 'app/config';
// common
import { ResponseInterceptor } from 'common/interceptors/response.interceptor';
import { AllExceptionsFilter } from 'common/filters/all-exceptions.filter';
import { HttpLogInterceptor } from 'common/interceptors/http-logger.interceptor';
import * as path from 'path';
import * as fs from 'fs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

// bootstrap the application
async function bootstrap() {
  // Ensure logs directory exists
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  try {

    const app = await NestFactory.create(AppModule, {
      bufferLogs: true, // Buffer logs until logger is set up
    });
    
    // Get app config
    const appCfg = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
    
    // Get loggers from container
    const httpLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    
    // Set global prefix for the api
    app.setGlobalPrefix('api/v1');
    
    // Apply global pipes, interceptors, and filters in the correct order
    
    // 1. First apply the HTTP logger interceptor to log all requests
    app.useGlobalInterceptors(new HttpLogInterceptor(httpLogger));
    
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
    app.useGlobalInterceptors(new ResponseInterceptor());
    
    // 4. Apply exception filter last
    app.useGlobalFilters(new AllExceptionsFilter(new Logger()));

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
bootstrap().catch(err => {
  console.error('Failed to start application:', err);
  process.exit(1);
});