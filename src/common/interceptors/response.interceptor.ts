import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse } from 'common/response/success';
import { isRawResponse } from 'common/types/response.types';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    return next.handle().pipe(
      map((data) => {
        // Allow controllers to bypass wrapping by returning ApiResponse directly
        if (data instanceof ApiResponse) {
          return data.toJSON();
        }

        // Allow controllers to bypass wrapping by returning { __raw: true, data: ... }
        if (isRawResponse(data)) {
          return data.data;
        }

        // Create standard success response
        const response = ApiResponse.success(data);

        // Add request ID if available
        if (req.id) {
          response.withRequestId(req.id);
        }

        return response.toJSON();
      }),
    );
  }
}
