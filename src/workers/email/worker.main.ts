import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';
import { Worker } from 'bullmq';

async function bootstrap() {
  // Worker không cần HTTP server, chỉ khởi tạo module để chạy processors
  const app = await NestFactory.createApplicationContext(WorkerModule);
  console.log('⚙️ Email worker started and listening for jobs');

  // Graceful shutdown - wait for current jobs to complete
  let isShuttingDown = false;

  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`⚙️ Email worker received ${signal}, waiting for current jobs to complete...`);

    try {
      // Close the NestJS app context
      await app.close();
      console.log('⚙️ Email worker shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('⚙️ Error during worker shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('⚙️ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('⚙️ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
}

bootstrap();
