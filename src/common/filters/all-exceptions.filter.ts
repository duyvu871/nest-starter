import {
  ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { 
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  RateLimitError,
  BaseClientError
} from '../response/client-errors';
import { InternalServerError, BaseServerError } from '../response/server-errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    // Default to internal server error
    let error: BaseClientError | BaseServerError;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    // Handle different types of exceptions
    if (exception instanceof BaseClientError || exception instanceof BaseServerError) {
      // Already using our error classes, use as is
      error = exception;
      status = exception.statusCode;
    } else if (exception instanceof HttpException) {
      // Convert NestJS HttpException to our error classes
      status = exception.getStatus();
      const response = exception.getResponse();
      let message: string;
      let details: Record<string, unknown> | undefined;

      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        const obj = response as Record<string, any>;
        message = obj.message ?? obj.error ?? 'Error';
        
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
      
      error = new BadRequestError(message, code, { 
        prismaCode: exception.code,
        target: exception.meta?.target
      });
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

    // Send the error response
    res.status(status).json(error.toResponse());
    
    // Log the error (could be extended with a proper logger)
    console.error('Exception caught:', error.getSummary());
  }
}