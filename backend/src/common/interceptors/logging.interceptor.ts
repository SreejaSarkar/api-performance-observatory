import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

type TrackedRequest = Request & {
  project?: { id: string };
  user?: { userId: string };
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<TrackedRequest>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();

    const log = (status: number) => {
      const actor = request.project
        ? ` project=${request.project.id}`
        : request.user
          ? ` user=${request.user.userId}`
          : '';
      const message = `${request.method} ${request.originalUrl} ${status} ${Date.now() - startedAt}ms${actor}`;

      if (status >= 500) {
        this.logger.error(message);
      } else if (status >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    };

    return next.handle().pipe(
      tap({
        next: () => log(response.statusCode),
        error: (error: unknown) =>
          log(error instanceof HttpException ? error.getStatus() : 500),
      }),
    );
  }
}
