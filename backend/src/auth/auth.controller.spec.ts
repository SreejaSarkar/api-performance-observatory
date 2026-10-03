import { InternalServerErrorException } from '@nestjs/common';

jest.mock('./guards/google-auth.guard', () => ({
  GoogleAuthGuard: class GoogleAuthGuard {},
}));

jest.mock('./guards/github-auth.guard', () => ({
  GithubAuthGuard: class GithubAuthGuard {},
}));

jest.mock('./guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class JwtAuthGuard {},
}));

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { AuthUser } from './types/auth-user.type';
import type { OAuthProfile } from './types/oauth-profile.type';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    process.env.FRONTEND_URL = 'https://frontend.example.com';
    delete process.env.COOKIE_DOMAIN;

    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      loginWithGoogle: jest.fn(),
      loginWithGithub: jest.fn(),
      getAuthProviders: jest.fn(),
      getCurrentUser: jest.fn(),
      getCookieNames: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    controller = new AuthController(authService);
  });

  afterEach(() => {
    delete process.env.FRONTEND_URL;
    delete process.env.COOKIE_DOMAIN;
  });

  function createResponse() {
    return {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    };
  }

  const authUser: AuthUser = {
    userId: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
  };

  const session = {
    user: authUser,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  it('registers a user and sets auth cookies', async () => {
    const dto = {
      email: 'user@example.com',
      name: 'Test User',
      password: 'password123',
    };
    const response = createResponse();

    authService.register.mockResolvedValue(session);

    await expect(controller.register(dto, response as never)).resolves.toEqual({
      user: authUser,
    });
    expect(authService.register.mock.calls).toEqual([[dto]]);
    expect(response.cookie.mock.calls).toEqual([
      [
        'access_token',
        'access-token',
        {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          path: '/',
          maxAge: 15 * 60 * 1000,
        },
      ],
      [
        'refresh_token',
        'refresh-token',
        {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      ],
    ]);
  });

  it('logs in a user and sets auth cookies', async () => {
    const dto = {
      email: 'user@example.com',
      password: 'password123',
    };
    const response = createResponse();

    authService.login.mockResolvedValue(session);

    await expect(controller.login(dto, response as never)).resolves.toEqual({
      user: authUser,
    });
    expect(authService.login.mock.calls).toEqual([[dto]]);
    expect(response.cookie).toHaveBeenCalledTimes(2);
  });

  it('refreshes a session from the refresh cookie and resets auth cookies', async () => {
    const response = createResponse();

    authService.refresh.mockResolvedValue(session);

    await expect(
      controller.refresh(
        {
          cookies: {
            refresh_token: 'refresh-token',
          },
        } as never,
        response as never,
      ),
    ).resolves.toEqual({
      user: authUser,
    });
    expect(authService.refresh.mock.calls).toEqual([['refresh-token']]);
    expect(response.cookie).toHaveBeenCalledTimes(2);
  });

  it('logs out a user and clears auth cookies', async () => {
    const response = createResponse();

    authService.logout.mockResolvedValue(undefined);

    await expect(
      controller.logout(
        {
          cookies: {
            refresh_token: 'refresh-token',
          },
        } as never,
        response as never,
      ),
    ).resolves.toEqual({
      success: true,
    });
    expect(authService.logout.mock.calls).toEqual([['refresh-token']]);
    expect(response.clearCookie.mock.calls).toEqual([
      [
        'access_token',
        {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          path: '/',
        },
      ],
      [
        'refresh_token',
        {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          path: '/',
        },
      ],
    ]);
  });

  it('returns undefined for OAuth login entrypoints', () => {
    expect(controller.googleLogin()).toBeUndefined();
    expect(controller.githubLogin()).toBeUndefined();
  });

  it('handles Google OAuth callback and redirects to the decoded next path', async () => {
    const response = createResponse();
    const profile: OAuthProfile = {
      providerAccountId: 'google-1',
      email: 'user@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
    };
    const state = Buffer.from(
      JSON.stringify({ next: '/dashboard' }),
      'utf8',
    ).toString('base64url');

    authService.loginWithGoogle.mockResolvedValue(session);
    response.redirect.mockReturnValue('redirected');

    await expect(
      controller.googleCallback(
        { user: profile } as never,
        state,
        response as never,
      ),
    ).resolves.toBe('redirected');
    expect(authService.loginWithGoogle.mock.calls).toEqual([[profile]]);
    expect(response.cookie).toHaveBeenCalledTimes(2);
    expect(response.redirect.mock.calls).toEqual([
      ['https://frontend.example.com/dashboard'],
    ]);
  });

  it('throws when the Google OAuth callback has no profile', async () => {
    const response = createResponse();

    await expect(
      controller.googleCallback({} as never, undefined, response as never),
    ).rejects.toThrow(
      new InternalServerErrorException('Google profile missing'),
    );
  });

  it('handles GitHub OAuth callback and falls back to /projects for invalid state', async () => {
    const response = createResponse();
    const profile: OAuthProfile = {
      providerAccountId: 'github-1',
      email: 'user@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
    };

    authService.loginWithGithub.mockResolvedValue(session);
    response.redirect.mockReturnValue('redirected');

    await expect(
      controller.githubCallback(
        { user: profile } as never,
        'not-valid-base64',
        response as never,
      ),
    ).resolves.toBe('redirected');
    expect(authService.loginWithGithub.mock.calls).toEqual([[profile]]);
    expect(response.redirect.mock.calls).toEqual([
      ['https://frontend.example.com/projects'],
    ]);
  });

  it('throws when the GitHub OAuth callback has no profile', async () => {
    const response = createResponse();

    await expect(
      controller.githubCallback({} as never, undefined, response as never),
    ).rejects.toThrow(
      new InternalServerErrorException('GitHub profile missing'),
    );
  });

  it('returns configured auth providers', () => {
    const providers = {
      google: true,
      github: false,
    };

    authService.getAuthProviders.mockReturnValue(providers);

    expect(controller.providers()).toEqual(providers);
  });

  it('returns the current authenticated user', async () => {
    authService.getCurrentUser.mockResolvedValue(authUser);

    await expect(controller.me(authUser)).resolves.toEqual(authUser);
    expect(authService.getCurrentUser.mock.calls).toEqual([['user-1']]);
  });
});
