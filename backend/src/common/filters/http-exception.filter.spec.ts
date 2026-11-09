import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    getType: () => 'http',
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', originalUrl: '/x' }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  let filter: HttpExceptionFilter;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    status.mockReturnValue({ json });
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    filter = new HttpExceptionFilter();
  });

  afterEach(() => errorSpy.mockRestore());

  it('formats HttpException responses', () => {
    filter.catch(new NotFoundException('Missing'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Missing',
        path: '/x',
      }),
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('keeps validation message arrays', () => {
    filter.catch(new BadRequestException(['a must be a string']), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: ['a must be a string'] }),
    );
  });

  it('hides unknown errors behind a 500 and logs them', () => {
    filter.catch(new Error('db password leaked'), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal server error' }),
    );
    expect(errorSpy).toHaveBeenCalled();
  });
});
