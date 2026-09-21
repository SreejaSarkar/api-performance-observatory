import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from "@nestjs/common";

import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";

import { Observatory } from "../client";

@Injectable()
class ObservatoryInterceptor
    implements NestInterceptor {
    constructor(
        private readonly observatory: Observatory,
    ) { }

    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {

        const request =
            context.switchToHttp().getRequest();

        const response =
            context.switchToHttp().getResponse();

        const start = Date.now();

        return next.handle().pipe(
            finalize(() => {
                this.observatory.track({
                    endpoint:
                        request.originalUrl,

                    method:
                        request.method,

                    latency:
                        Date.now() - start,

                    statusCode:
                        response.statusCode,

                    userAgent:
                        request.headers["user-agent"],
                });
            }),
        );
    }
}

export function createNestInterceptor(
    observatory: Observatory,
): NestInterceptor {
    return new ObservatoryInterceptor(
        observatory,
    );
}