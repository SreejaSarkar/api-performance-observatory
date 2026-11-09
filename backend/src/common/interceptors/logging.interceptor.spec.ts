import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';

import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  const buildContext = (type = 'http') =>
    ({
      getType: () => type,
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          originalUrl: '/ingestion/metric',
          project: { id: 'p1' },
        }),
        getResponse: () => ({ statusCode: 201 }),
      }),
    }) as unknown as ExecutionContext;

  let interceptor: LoggingInterceptor;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    interceptor = new LoggingInterceptor();
  });

  afterEach(() => jest.restoreAllMocks());

  it('logs successful requests with the project id', async () => {
    const handler: CallHandler = { handle: () => of('ok') };

    await lastValueFrom(interceptor.intercept(buildContext(), handler));

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/POST \/ingestion\/metric 201 \d+ms project=p1/),
    );
  });

  it('warns on 4xx errors and rethrows', async () => {
    const handler: CallHandler = {
      handle: () => throwError(() => new BadRequestException()),
    };

    await expect(
      lastValueFrom(interceptor.intercept(buildContext(), handler)),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(' 400 '));
  });

  it('skips non-http contexts', async () => {
    const handler: CallHandler = { handle: () => of('ok') };

    await lastValueFrom(interceptor.intercept(buildContext('ws'), handler));

    expect(logSpy).not.toHaveBeenCalled();
  });
});
