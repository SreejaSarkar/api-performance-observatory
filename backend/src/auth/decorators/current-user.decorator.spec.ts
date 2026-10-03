import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

import { CurrentUser } from './current-user.decorator';
import { AuthUser } from '../types/auth-user.type';

describe('CurrentUser', () => {
  it('extracts the authenticated user from the request', () => {
    class TestController {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@CurrentUser() _user: AuthUser | undefined) {}
    }

    const routeArgsMetadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'test',
    ) as Record<
      string,
      { factory: (data: unknown, ctx: ExecutionContext) => unknown }
    >;

    const [metadata] = Object.values(routeArgsMetadata);
    const user: AuthUser = {
      userId: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    };
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;

    expect(metadata.factory(undefined, ctx)).toEqual(user);
  });
});
