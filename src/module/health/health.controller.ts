import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { ApiSuccess } from 'common/decorators';
import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  private isProduction: boolean;
  private healthEndpointsEnabled: boolean;

  constructor(
    private configService: ConfigService,
    private healthService: HealthService,
  ) {
    // Check if we're in production environment
    this.isProduction = this.configService.get('NODE_ENV') === 'production';

    // Check if detailed health endpoints are enabled (default: false in production)
    this.healthEndpointsEnabled =
      this.configService.get('HEALTH_ENDPOINTS_ENABLED', 'false') === 'true';
  }

  /**
   * Check if health endpoints are allowed to be accessed
   */
  private isHealthEndpointAllowed(): boolean {
    // Always allow in development
    if (!this.isProduction) return true;

    // In production, only allow if explicitly enabled
    return this.healthEndpointsEnabled;
  }

  /**
   * Basic liveness check - checks if the application is running
   */
  @Get('live')
  @ApiSuccess('Application is alive')
  @HealthCheck()
  async liveness() {
    return this.healthService.liveness();
  }

  /**
   * Comprehensive health check - checks database and system
   * Only available when HEALTH_ENDPOINTS_ENABLED=true or in development
   */
  @Get()
  @ApiSuccess('Application is healthy')
  @HealthCheck()
  async health() {
    if (!this.isHealthEndpointAllowed()) {
      throw new Error('Health endpoint not available in production');
    }

    return this.healthService.check();
  }
}
