import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  type LoggerService,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  RateLimitError,
  BaseClientError,
} from 'common/response/client-errors';
import {
  InternalServerError,
  BaseServerError,
} from 'common/response/server-errors';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default to internal server error
    let error: BaseClientError | BaseServerError;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Handle different types of exceptions
    if (
      exception instanceof BaseClientError ||
      exception instanceof BaseServerError
    ) {
      // Already using our error classes, use as is
      error = exception;
      status = exception.statusCode;
    } else if (exception instanceof HttpException) {
      // Convert NestJS HttpException to our error classes
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      let message: string;
      let details: Record<string, unknown> | undefined;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        const obj = exceptionResponse as Record<string, unknown>;
        message = (obj.message as string) ?? (obj.error as string) ?? 'Error';
        
        if (Array.isArray(obj.message)) {
          details = { validationErrors: obj.message };
          message = 'Validation failed';
        }
      } else {
        message = exception.message;
      }

      // Map HTTP status code to appropriate error class
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          error = new BadRequestError(message, 'BAD_REQUEST', details);
          break;
        case HttpStatus.UNAUTHORIZED:
          error = new UnauthorizedError(message, 'UNAUTHORIZED', details);
          break;
        case HttpStatus.FORBIDDEN:
          error = new ForbiddenError(message, 'FORBIDDEN', details);
          break;
        case HttpStatus.NOT_FOUND:
          error = new NotFoundError(message, 'NOT_FOUND', details);
          break;
        case HttpStatus.CONFLICT:
          error = new ConflictError(message, 'CONFLICT', details);
          break;
        case HttpStatus.UNPROCESSABLE_ENTITY:
          error = new ValidationError(message, 'VALIDATION_ERROR', details);
          break;
        case HttpStatus.TOO_MANY_REQUESTS:
          error = new RateLimitError(message, 'RATE_LIMIT', details);
          break;
        default:
          error = new InternalServerError(message, 'INTERNAL_ERROR', details);
          break;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma errors
      status = HttpStatus.BAD_REQUEST;
      let message = `Database error: ${exception.code}`;
      let code = 'DATABASE_ERROR';
      
      // Map common Prisma error codes to more specific messages
      switch (exception.code) {
        case 'P2002':
          message = 'Unique constraint violation';
          code = 'UNIQUE_CONSTRAINT';
          break;
        case 'P2025':
          message = 'Record not found';
          code = 'RECORD_NOT_FOUND';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = 'Foreign key constraint violation';
          code = 'FOREIGN_KEY_CONSTRAINT';
          break;
      }
      
      const details: Record<string, unknown> = { 
        prismaCode: exception.code
      };
      
      if (exception.meta && typeof exception.meta === 'object' && 'target' in exception.meta) {
        details.target = exception.meta.target;
      }
      
      error = new BadRequestError(message, code, details);
    } else if (exception instanceof Error) {
      // Handle generic Error objects
      error = new InternalServerError(
        exception.message || 'Internal server error',
        'INTERNAL_ERROR',
        { stack: exception.stack }
      );
    } else {
      // Handle unknown errors
      error = new InternalServerError('Unknown error occurred', 'UNKNOWN_ERROR');
    }

    // Log detailed error information
    this.logError(request, error, exception);

    // Send the error response
    response.status(status).json(error.toResponse());
  }

  private logError(request: Request, error: BaseClientError | BaseServerError, originalException: unknown): void {
    const errorContext = {
      requestId: (request as any).requestId || 'unknown',
      path: request.url,
      method: request.method,
      ip: request.ip,
      userId: (request as any).user?.id || 'anonymous',
      errorCode: error.code,
      statusCode: error.statusCode,
    };

    // Client errors (4xx) are logged as warnings, server errors (5xx) as errors
    if (error.statusCode >= 500) {
      this.logger.error(`Server error: ${error.message}`, {
        ...errorContext,
        stack: originalException instanceof Error ? originalException.stack : undefined,
        details: error.details,
      });
    } else if (error.statusCode >= 400) {
      this.logger.warn(`Client error: ${error.message}`, {
        ...errorContext,
        details: error.details,
      });
    }
  }
}