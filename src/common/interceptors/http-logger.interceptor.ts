import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  type LoggerService,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class HttpLogInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}
  
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const http = ctx.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const start = performance.now();
    const requestId = this.generateRequestId();
    
    // Attach request ID to request object for use in other parts of the app
    req.requestId = requestId;
    
    // // Log the incoming request
    // this.logger.log('Request received', {
    //   requestId,
    //   method: req.method,
    //   url: req.url,
    //   ip: req.ip,
    //   userAgent: req.get('user-agent') || 'unknown',
    //   query: req.query,
    //   params: req.params,
    //   // Avoid logging sensitive information like passwords
    //   body: this.sanitizeBody(req.body),
    // });

    return next.handle().pipe(
      tap((data) => {
        const ms = performance.now() - start;
        
        // Log successful response
        this.logger.log('Response sent', {
          requestId,
          statusCode: res.statusCode,
          durationMs: `${ms.toFixed(2)}ms`,
          responseSize: this.getApproximateSize(data),
        });
      }),
      catchError((error) => {
        const ms = performance.now() - start;
        
        // Log error response
        this.logger.error('Request failed', {
          requestId,
          statusCode: error.status || 500,
          error: error.message,
          durationMs: `${ms.toFixed(2)}ms`,
          path: req.url,
          method: req.method,
        });
        
        // Re-throw the error so it can be handled by the exception filter
        throw error;
      }),
    );
  }

  private generateRequestId(): string {
    // Generate a simple unique ID
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    
    // List of sensitive fields to mask
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key', 'key', 'authorization'];
    
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private getApproximateSize(data: any): string {
    if (!data) return '0B';
    
    try {
      const jsonString = JSON.stringify(data);
      const bytes = new TextEncoder().encode(jsonString).length;
      
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)}KB`;
      return `${(bytes / 1048576).toFixed(2)}MB`;
    } catch (e) {
      return 'unknown';
    }
  }
}