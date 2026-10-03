import { ExecutionContext } from '@nestjs/common';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => class {},
}));

import { GithubAuthGuard } from './github-auth.guard';

describe('GithubAuthGuard', () => {
  let guard: GithubAuthGuard;

  beforeEach(() => {
    guard = new GithubAuthGuard();
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

  it('returns GitHub email scope and preserves a valid next path', () => {
    const options = guard.getAuthenticateOptions(createContext('/dashboard'));

    expect(options.scope).toEqual(['user:email']);
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
