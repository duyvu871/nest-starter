// core
import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
// app
import { AppModule } from 'app/app.module';
import { appConfig } from 'app/config';
// common
import { ResponseInterceptor } from 'common/interceptors/response.interceptor';
import { AllExceptionsFilter } from 'common/filters/all-exceptions.filter';

// bootstrap the application
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // get the app config
  const appCfg = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);
  // set global prefix for the api
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // remove extra properties from the request body
    transform: true, // transform the request body to the DTO
    forbidNonWhitelisted: true, // throw an error if there are extra properties in the request body
    transformOptions: { 
      enableImplicitConversion: true, // convert the request body to the DTO
    },
  }));
  app.useGlobalInterceptors(new ResponseInterceptor()); // intercept the response and return the response in the desired format
  app.useGlobalFilters(new AllExceptionsFilter()); // handle all exceptions and return the error in the desired format

  // start the application
  const port = appCfg.port;
  await app.listen(port);
  console.log(`🚀 Server ${appCfg.name} running on http://localhost:${port}`);
}
bootstrap();
