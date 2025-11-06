import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { STATUS_CODES } from 'http';

export interface StandardResponse<T> {
  message: string;
  data: T | null;
  statusCode: number;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    const httpContext = context.switchToHttp();
    const res = httpContext.getResponse<Response>();

    return next.handle().pipe(
      map((data: T): StandardResponse<T> => {
        // Jika controller sudah mengembalikan struktur dengan message & data
        if ('message' in (data as Record<string, unknown>)) {
          const typedData = data as {
            message: string;
            data?: T;
          };

          return {
            message: typedData.message,
            data: typedData.data ?? null,
            statusCode: res.statusCode,
          };
        }

        // Default case (tanpa message)
        return {
          message: STATUS_CODES[res.statusCode] ?? 'Success',
          data: data ?? null,
          statusCode: res.statusCode,
        };
      }),
    );
  }
}
