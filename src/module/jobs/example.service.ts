import { CronJob } from 'cron';
import type { ConfigType } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

// config
import { jobsConfig } from 'app/config';
import { CONTEXT_LOGGER_TOKEN } from 'app/common/logger';
import { LoggerService } from 'common/logger/logger.service';

@Injectable()
export class ExampleService implements OnModuleInit {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(jobsConfig.KEY)
    private readonly jobsCfg: ConfigType<typeof jobsConfig>,
    @Inject(CONTEXT_LOGGER_TOKEN('APP')) private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.logger.info('Example job is initializing');
    const job = new CronJob(
      this.jobsCfg.exampleCron,
      () => this.run(),
      null,
      true,
      this.jobsCfg.timezone,
    );
    this.schedulerRegistry.addCronJob('example', job);
    job.start();
  }

  run() {
    this.logger.info('Example job is running at', {
      date: new Date().toISOString(),
    });
  }
}
