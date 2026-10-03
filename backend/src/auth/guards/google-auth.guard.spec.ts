import { ExecutionContext } from '@nestjs/common';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class {},
}));

import { GoogleAuthGuard } from './google-auth.guard';

describe('GoogleAuthGuard', () => {
  let guard: GoogleAuthGuard;

  beforeEach(() => {
    guard = new GoogleAuthGuard();
  });

  function createContext(next?: unknown) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {
            next,
          },
        }),
      }),
    } as ExecutionContext;
  }

  function decodeState(state: string) {
    return JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
      next: string;
    };
  }

  it('returns Google scopes, account prompt, and preserves a valid next path', () => {
    const options = guard.getAuthenticateOptions(createContext('/dashboard'));

    expect(options.scope).toEqual(['email', 'profile']);
    expect(options.prompt).toBe('select_account');
    expect(decodeState(options.state)).toEqual({
      next: '/dashboard',
    });
  });

  it('falls back to /projects when next is missing', () => {
    const options = guard.getAuthenticateOptions(createContext());

    expect(decodeState(options.state)).toEqual({
      next: '/projects',
    });
  });

  it('falls back to /projects when next is not a safe relative path', () => {
    const options = guard.getAuthenticateOptions(
      createContext('https://example.com/malicious'),
    );

    expect(decodeState(options.state)).toEqual({
      next: '/projects',
    });
  });
});
