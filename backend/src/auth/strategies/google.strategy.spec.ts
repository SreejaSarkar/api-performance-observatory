const mockPassportStrategyConstructor = jest.fn();

jest.mock('@nestjs/passport', () => ({
  PassportStrategy: () =>
    class {
      constructor(...args: unknown[]) {
        mockPassportStrategyConstructor(...args);
      }
    },
}));

jest.mock('passport-google-oauth20', () => ({
  Strategy: class MockGoogleStrategy {},
}));

import type { ConfigService } from '@nestjs/config';
import type { Profile } from 'passport-google-oauth20';

import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
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
      id: 'google-user-1',
      displayName: 'Google User',
      emails: [{ value: 'USER@Example.com', verified: true }],
      photos: [{ value: 'https://example.com/avatar.png' }],
      provider: 'google',
      _raw: '',
      _json: {},
      ...overrides,
    } as Profile;
  }

  it('passes configured OAuth settings to PassportStrategy', () => {
    const configService = createConfigService({
      BACKEND_URL: 'https://api.example.com',
      GOOGLE_CLIENT_ID: 'google-client-id',
      GOOGLE_CLIENT_SECRET: 'google-client-secret',
      GOOGLE_CALLBACK_URL: 'https://api.example.com/custom-callback',
    });

    new GoogleStrategy(configService);

    expect(mockPassportStrategyConstructor.mock.calls).toEqual([
      [
        {
          clientID: 'google-client-id',
          clientSecret: 'google-client-secret',
          callbackURL: 'https://api.example.com/custom-callback',
          scope: ['email', 'profile'],
        },
      ],
    ]);
  });

  it('falls back to default callback and placeholder credentials when config is missing', () => {
    const configService = createConfigService({});

    new GoogleStrategy(configService);

    expect(mockPassportStrategyConstructor.mock.calls).toEqual([
      [
        {
          clientID: 'missing-google-client-id',
          clientSecret: 'missing-google-client-secret',
          callbackURL: 'http://localhost:3001/auth/google/callback',
          scope: ['email', 'profile'],
        },
      ],
    ]);
  });

  it('maps the Google profile into the app OAuthProfile shape', () => {
    const strategy = new GoogleStrategy(createConfigService({}));

    const result = strategy.validate(
      'access-token',
      'refresh-token',
      createProfile(),
    );

    expect(result).toEqual({
      providerAccountId: 'google-user-1',
      email: 'user@example.com',
      name: 'Google User',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });

  it('falls back to the email or default name when displayName is missing', () => {
    const strategy = new GoogleStrategy(createConfigService({}));

    const emailFallback = strategy.validate(
      'access-token',
      'refresh-token',
      createProfile({
        displayName: '',
      }),
    );
    const defaultFallback = strategy.validate(
      'access-token',
      'refresh-token',
      createProfile({
        displayName: '',
        emails: [],
        photos: [],
      }),
    );

    expect(emailFallback.name).toBe('user@example.com');
    expect(defaultFallback).toEqual({
      providerAccountId: 'google-user-1',
      email: '',
      name: 'Google user',
      avatarUrl: undefined,
    });
  });
});
