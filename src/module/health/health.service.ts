import { Injectable } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { SystemHealthIndicator } from './indicators/system.health';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private db: DatabaseHealthIndicator,
    private system: SystemHealthIndicator,
  ) {}

  async check() {
    return this.health.check([
      () => this.db.isHealthy('database'),
      () => this.system.checkSystem(),
    ]);
  }

  async liveness() {
    return this.health.check([() => this.system.checkSystem()]);
  }
}
