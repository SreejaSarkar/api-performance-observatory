import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: {
    verifyAsync: jest.Mock;
  };
  let configService: {
    getOrThrow: jest.Mock;
  };

  type TestRequest = {
    headers?: {
      authorization?: string;
    };
    cookies?: {
      access_token?: string;
    };
    user?: {
      userId: string;
      email: string;
      name: string;
    };
  };

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    };

    configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    };

    guard = new JwtAuthGuard(jwtService as never, configService as never);
  });

  function createContext(request: TestRequest) {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }

  it('verifies a bearer token and attaches the authenticated user', async () => {
    const request: TestRequest = {
      headers: {
        authorization: 'Bearer header-token',
      },
      cookies: {},
    };

    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(jwtService.verifyAsync.mock.calls).toEqual([
      ['header-token', { secret: 'test-secret' }],
    ]);
    expect(configService.getOrThrow.mock.calls).toEqual([
      ['JWT_ACCESS_SECRET'],
    ]);
    expect(request.user).toEqual({
      userId: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    });
  });

  it('falls back to the access token cookie when no bearer token is present', async () => {
    const request: TestRequest = {
      headers: {},
      cookies: {
        access_token: 'cookie-token',
      },
    };

    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-2',
      email: 'cookie@example.com',
      name: 'Cookie User',
    });

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(jwtService.verifyAsync.mock.calls).toEqual([
      ['cookie-token', { secret: 'test-secret' }],
    ]);
    expect(request.user).toEqual({
      userId: 'user-2',
      email: 'cookie@example.com',
      name: 'Cookie User',
    });
  });

  it('throws when no access token is present', async () => {
    await expect(
      guard.canActivate(
        createContext({
          headers: {},
          cookies: {},
        }),
      ),
    ).rejects.toThrow(new UnauthorizedException('Missing access token'));

    expect(jwtService.verifyAsync.mock.calls).toEqual([]);
  });

  it('throws when token verification fails', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(
      guard.canActivate(
        createContext({
          headers: {
            authorization: 'Bearer broken-token',
          },
          cookies: {},
        }),
      ),
    ).rejects.toThrow(new UnauthorizedException('Invalid access token'));
  });
});
