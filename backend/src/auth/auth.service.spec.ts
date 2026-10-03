import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, User } from '@prisma/client';
import { createHash } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import type { OAuthProfile } from './types/oauth-profile.type';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const {
  hash: mockHash,
  compare: mockCompare,
}: {
  hash: jest.Mock<Promise<string>, [string, number]>;
  compare: jest.Mock<Promise<boolean>, [string, string]>;
} = jest.requireMock('bcrypt');

type PrismaMocks = {
  user: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  userAccount: {
    findUnique: jest.Mock;
  };
  refreshToken: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
};

type JwtServiceMocks = {
  signAsync: jest.Mock;
  verifyAsync: jest.Mock;
};

type ConfigServiceMocks = {
  get: jest.Mock;
  getOrThrow: jest.Mock;
};

type RefreshTokenCreateInput = {
  data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  };
};

type RefreshTokenUpdateInput = {
  where: {
    id: string;
  };
  data: {
    revokedAt: Date;
  };
};

type RefreshTokenUpdateManyInput = {
  where: {
    tokenHash: string;
    revokedAt: null;
  };
  data: {
    revokedAt: Date;
  };
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMocks;
  let jwtService: JwtServiceMocks;
  let configService: ConfigServiceMocks;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      userAccount: {
        findUnique: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    configService = {
      get: jest.fn(),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'JWT_ACCESS_SECRET') {
          return 'access-secret';
        }

        if (key === 'JWT_REFRESH_SECRET') {
          return 'refresh-secret';
        }

        throw new Error(`Unexpected config key: ${key}`);
      }),
    };

    mockHash.mockReset();
    mockCompare.mockReset();

    service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  function createUser(overrides: Partial<User> = {}): User {
    return {
      id: 'user-1',
      email: 'user@example.com',
      passwordHash: 'stored-password-hash',
      name: 'Test User',
      avatarUrl: null,
      isEmailVerified: false,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      ...overrides,
    };
  }

  function expectTokenHash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  function mockSessionTokens(
    accessToken = 'access-token',
    refreshToken = 'refresh-token',
  ) {
    jwtService.signAsync.mockResolvedValueOnce(accessToken);
    jwtService.signAsync.mockResolvedValueOnce(refreshToken);
    prisma.refreshToken.create.mockResolvedValue({ id: 'token-1' });
  }

  it('registers a local user and creates a session', async () => {
    const user = createUser();

    prisma.user.findUnique.mockResolvedValue(null);
    mockHash.mockResolvedValue('hashed-password');
    prisma.user.create.mockResolvedValue(user);
    mockSessionTokens();

    await expect(
      service.register({
        email: 'USER@EXAMPLE.COM',
        name: 'Test User',
        password: 'password123',
      }),
    ).resolves.toEqual({
      user: {
        userId: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(prisma.user.findUnique.mock.calls).toEqual([
      [
        {
          where: {
            email: 'user@example.com',
          },
        },
      ],
    ]);
    expect(mockHash.mock.calls).toEqual([['password123', 10]]);
    expect(prisma.user.create.mock.calls).toEqual([
      [
        {
          data: {
            email: 'user@example.com',
            name: 'Test User',
            passwordHash: 'hashed-password',
            accounts: {
              create: {
                provider: AuthProvider.LOCAL,
                providerAccountId: 'user@example.com',
              },
            },
          },
        },
      ],
    ]);
    expect(jwtService.signAsync.mock.calls).toEqual([
      [
        {
          sub: 'user-1',
          email: 'user@example.com',
          name: 'Test User',
        },
        {
          secret: 'access-secret',
          expiresIn: '15m',
        },
      ],
      [
        {
          sub: 'user-1',
        },
        {
          secret: 'refresh-secret',
          expiresIn: '7d',
        },
      ],
    ]);

    const refreshTokenCreateCalls = prisma.refreshToken.create.mock
      .calls as RefreshTokenCreateInput[][];
    const refreshTokenCreateArgs = refreshTokenCreateCalls[0][0];

    expect(refreshTokenCreateArgs.data.userId).toBe('user-1');
    expect(refreshTokenCreateArgs.data.tokenHash).toBe(
      expectTokenHash('refresh-token'),
    );
    expect(refreshTokenCreateArgs.data.expiresAt).toBeInstanceOf(Date);
  });

  it('rejects registration when the email already exists', async () => {
    prisma.user.findUnique.mockResolvedValue(createUser());

    await expect(
      service.register({
        email: 'user@example.com',
        name: 'Test User',
        password: 'password123',
      }),
    ).rejects.toThrow(new ConflictException('Email already registered'));

    expect(mockHash).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects login when the user has no local password', async () => {
    prisma.user.findUnique.mockResolvedValue(
      createUser({ passwordHash: null }),
    );

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));

    expect(mockCompare).not.toHaveBeenCalled();
  });

  it('rejects login when the password does not match', async () => {
    prisma.user.findUnique.mockResolvedValue(createUser());
    mockCompare.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
  });

  it('logs in a local user and creates a session', async () => {
    prisma.user.findUnique.mockResolvedValue(createUser());
    mockCompare.mockResolvedValue(true);
    mockSessionTokens('new-access-token', 'new-refresh-token');

    await expect(
      service.login({
        email: 'USER@EXAMPLE.COM',
        password: 'password123',
      }),
    ).resolves.toEqual({
      user: {
        userId: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
      },
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    expect(prisma.user.findUnique.mock.calls).toEqual([
      [
        {
          where: {
            email: 'user@example.com',
          },
        },
      ],
    ]);
    expect(mockCompare.mock.calls).toEqual([
      ['password123', 'stored-password-hash'],
    ]);
  });

  it('rejects OAuth login when the provider profile has no email', async () => {
    await expect(
      service.loginWithGoogle({
        providerAccountId: 'google-1',
        email: '',
        name: 'Test User',
      }),
    ).rejects.toThrow(
      new UnauthorizedException('Google account email is required'),
    );
  });

  it('logs in with an existing linked Google account', async () => {
    const existingUser = createUser({
      name: 'Old Name',
      avatarUrl: null,
      isEmailVerified: false,
    });
    const profile: OAuthProfile = {
      providerAccountId: 'google-1',
      email: 'user@example.com',
      name: 'Updated Name',
      avatarUrl: 'https://example.com/avatar.png',
    };

    prisma.userAccount.findUnique.mockResolvedValue({
      userId: existingUser.id,
      user: existingUser,
    });
    prisma.user.update.mockResolvedValue(
      createUser({
        name: 'Updated Name',
        avatarUrl: 'https://example.com/avatar.png',
        isEmailVerified: true,
      }),
    );
    mockSessionTokens();

    await expect(service.loginWithGoogle(profile)).resolves.toEqual({
      user: {
        userId: 'user-1',
        email: 'user@example.com',
        name: 'Updated Name',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(prisma.userAccount.findUnique.mock.calls).toEqual([
      [
        {
          where: {
            provider_providerAccountId: {
              provider: AuthProvider.GOOGLE,
              providerAccountId: 'google-1',
            },
          },
          include: {
            user: true,
          },
        },
      ],
    ]);
    expect(prisma.user.update.mock.calls).toEqual([
      [
        {
          where: {
            id: 'user-1',
          },
          data: {
            name: 'Updated Name',
            avatarUrl: 'https://example.com/avatar.png',
            isEmailVerified: true,
          },
        },
      ],
    ]);
  });

  it('links an existing user during GitHub OAuth login', async () => {
    const existingUser = createUser({
      email: 'github@example.com',
      name: 'Existing User',
      avatarUrl: 'https://example.com/old-avatar.png',
    });
    const profile: OAuthProfile = {
      providerAccountId: 'github-1',
      email: 'github@example.com',
      name: 'GitHub User',
      avatarUrl: 'https://example.com/new-avatar.png',
    };

    prisma.userAccount.findUnique.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue(existingUser);
    prisma.user.update.mockResolvedValue(
      createUser({
        email: 'github@example.com',
        name: 'GitHub User',
        avatarUrl: 'https://example.com/new-avatar.png',
        isEmailVerified: true,
      }),
    );
    mockSessionTokens('github-access-token', 'github-refresh-token');

    await expect(service.loginWithGithub(profile)).resolves.toEqual({
      user: {
        userId: 'user-1',
        email: 'github@example.com',
        name: 'GitHub User',
      },
      accessToken: 'github-access-token',
      refreshToken: 'github-refresh-token',
    });

    expect(prisma.user.update.mock.calls).toEqual([
      [
        {
          where: {
            id: 'user-1',
          },
          data: {
            name: 'GitHub User',
            avatarUrl: 'https://example.com/new-avatar.png',
            isEmailVerified: true,
            accounts: {
              create: {
                provider: AuthProvider.GITHUB,
                providerAccountId: 'github-1',
              },
            },
          },
        },
      ],
    ]);
  });

  it('returns which OAuth providers are configured', () => {
    configService.get.mockImplementation((key: string) => {
      const values: Record<string, string | undefined> = {
        GOOGLE_CLIENT_ID: 'google-client-id',
        GOOGLE_CLIENT_SECRET: 'google-client-secret',
        GITHUB_CLIENT_ID: 'github-client-id',
        GITHUB_CLIENT_SECRET: undefined,
      };

      return values[key];
    });

    expect(service.getAuthProviders()).toEqual({
      google: true,
      github: false,
    });
  });

  it('rejects refresh when the token is missing', async () => {
    await expect(service.refresh('')).rejects.toThrow(
      new UnauthorizedException('Missing refresh token'),
    );
  });

  it('rejects refresh when the stored token is invalid', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
    prisma.refreshToken.findUnique.mockResolvedValue(null);

    await expect(service.refresh('refresh-token')).rejects.toThrow(
      new UnauthorizedException('Invalid refresh token'),
    );

    expect(prisma.refreshToken.findUnique.mock.calls).toEqual([
      [
        {
          where: {
            tokenHash: expectTokenHash('refresh-token'),
          },
          include: {
            user: true,
          },
        },
      ],
    ]);
  });

  it('refreshes a valid session and revokes the previous refresh token', async () => {
    const user = createUser();

    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'stored-token-1',
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user,
    });
    prisma.refreshToken.update.mockResolvedValue({ id: 'stored-token-1' });
    mockSessionTokens('refreshed-access-token', 'refreshed-refresh-token');

    await expect(service.refresh('refresh-token')).resolves.toEqual({
      user: {
        userId: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
      },
      accessToken: 'refreshed-access-token',
      refreshToken: 'refreshed-refresh-token',
    });

    expect(jwtService.verifyAsync.mock.calls).toEqual([
      ['refresh-token', { secret: 'refresh-secret' }],
    ]);

    const refreshTokenUpdateCalls = prisma.refreshToken.update.mock
      .calls as RefreshTokenUpdateInput[][];
    const refreshTokenUpdateArgs = refreshTokenUpdateCalls[0][0];

    expect(refreshTokenUpdateArgs.where.id).toBe('stored-token-1');
    expect(refreshTokenUpdateArgs.data.revokedAt).toBeInstanceOf(Date);
  });

  it('returns early from logout when no refresh token is provided', async () => {
    await expect(service.logout()).resolves.toBeUndefined();

    expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
  });

  it('revokes matching refresh tokens on logout', async () => {
    prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.logout('refresh-token')).resolves.toBeUndefined();

    const refreshTokenUpdateManyCalls = prisma.refreshToken.updateMany.mock
      .calls as RefreshTokenUpdateManyInput[][];
    const refreshTokenUpdateManyArgs = refreshTokenUpdateManyCalls[0][0];

    expect(refreshTokenUpdateManyArgs.where.tokenHash).toBe(
      expectTokenHash('refresh-token'),
    );
    expect(refreshTokenUpdateManyArgs.where.revokedAt).toBeNull();
    expect(refreshTokenUpdateManyArgs.data.revokedAt).toBeInstanceOf(Date);
  });

  it('returns the current authenticated user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    });

    await expect(service.getCurrentUser('user-1')).resolves.toEqual({
      userId: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    });

    expect(prisma.user.findUnique.mock.calls).toEqual([
      [
        {
          where: {
            id: 'user-1',
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      ],
    ]);
  });

  it('rejects when the current user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getCurrentUser('missing-user')).rejects.toThrow(
      new UnauthorizedException('User not found'),
    );
  });

  it('returns the auth cookie names', () => {
    expect(service.getCookieNames()).toEqual({
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });
  });
});
