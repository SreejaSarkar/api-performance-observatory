const mockPassportStrategyConstructor = jest.fn();

jest.mock('@nestjs/passport', () => ({
  PassportStrategy: () =>
    class {
      constructor(...args: unknown[]) {
        mockPassportStrategyConstructor(...args);
      }
    },
}));

jest.mock('passport-github2', () => ({
  Strategy: class MockGithubStrategy {},
}));

import type { ConfigService } from '@nestjs/config';
import type { Profile } from 'passport-github2';

import { GithubStrategy } from './github.strategy';

describe('GithubStrategy', () => {
  beforeEach(() => {
    mockPassportStrategyConstructor.mockReset();
  });

  function createConfigService(values: Record<string, string | undefined>) {
    return {
      get: jest.fn((key: string) => values[key]),
    } as Pick<ConfigService, 'get'> as ConfigService;
  }

  function createProfile(overrides?: Partial<Profile>) {
    return {
      id: 'github-user-1',
      displayName: 'GitHub User',
      username: 'octocat',
      emails: [{ value: 'USER@Example.com', verified: true }],
      photos: [{ value: 'https://example.com/avatar.png' }],
      provider: 'github',
      _raw: '',
      _json: {},
      ...overrides,
    } as Profile;
  }

  it('passes configured OAuth settings to PassportStrategy', () => {
    const configService = createConfigService({
      BACKEND_URL: 'https://api.example.com',
      GITHUB_CLIENT_ID: 'github-client-id',
      GITHUB_CLIENT_SECRET: 'github-client-secret',
      GITHUB_CALLBACK_URL: 'https://api.example.com/custom-callback',
    });

    new GithubStrategy(configService);

    expect(mockPassportStrategyConstructor.mock.calls).toEqual([
      [
        {
          clientID: 'github-client-id',
          clientSecret: 'github-client-secret',
          callbackURL: 'https://api.example.com/custom-callback',
          scope: ['user:email'],
        },
      ],
    ]);
  });

  it('falls back to default callback and placeholder credentials when config is missing', () => {
    const configService = createConfigService({});

    new GithubStrategy(configService);

    expect(mockPassportStrategyConstructor.mock.calls).toEqual([
      [
        {
          clientID: 'missing-github-client-id',
          clientSecret: 'missing-github-client-secret',
          callbackURL: 'http://localhost:3001/auth/github/callback',
          scope: ['user:email'],
        },
      ],
    ]);
  });

  it('maps the GitHub profile into the app OAuthProfile shape', () => {
    const strategy = new GithubStrategy(createConfigService({}));

    const result = strategy.validate(
      'access-token',
      'refresh-token',
      createProfile(),
    );

    expect(result).toEqual({
      providerAccountId: 'github-user-1',
      email: 'user@example.com',
      name: 'GitHub User',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });

  it('falls back to username, then email, then default name', () => {
    const strategy = new GithubStrategy(createConfigService({}));

    const usernameFallback = strategy.validate(
      'access-token',
      'refresh-token',
      createProfile({
        displayName: '',
      }),
    );
    const emailFallback = strategy.validate(
      'access-token',
      'refresh-token',
      createProfile({
        displayName: '',
        username: '',
      }),
    );
    const defaultFallback = strategy.validate(
      'access-token',
      'refresh-token',
      createProfile({
        displayName: '',
        username: '',
        emails: [],
        photos: [],
      }),
    );

    expect(usernameFallback.name).toBe('octocat');
    expect(emailFallback.name).toBe('user@example.com');
    expect(defaultFallback).toEqual({
      providerAccountId: 'github-user-1',
      email: '',
      name: 'GitHub user',
      avatarUrl: undefined,
    });
  });
});
