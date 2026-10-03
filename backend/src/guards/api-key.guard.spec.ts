import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let projectsService: {
    findByApiKey: jest.Mock;
  };

  type TestRequest = {
    headers: {
      'x-api-key'?: string | string[];
    };
    project?: {
      id: string;
      apiKey: string;
      name: string;
    };
  };

  beforeEach(() => {
    projectsService = {
      findByApiKey: jest.fn(),
    };

    guard = new ApiKeyGuard(projectsService as never);
  });

  function createContext(request: TestRequest) {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  }

  it('throws when the request does not include an API key header', async () => {
    await expect(
      guard.canActivate(
        createContext({
          headers: {},
        }),
      ),
    ).rejects.toThrow(new UnauthorizedException('Missing API key'));

    expect(projectsService.findByApiKey.mock.calls).toEqual([]);
  });

  it('throws when the API key does not resolve to a project', async () => {
    projectsService.findByApiKey.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        createContext({
          headers: {
            'x-api-key': 'invalid-api-key',
          },
        }),
      ),
    ).rejects.toThrow(new UnauthorizedException('Invalid API key'));

    expect(projectsService.findByApiKey.mock.calls).toEqual([
      ['invalid-api-key'],
    ]);
  });

  it('accepts the request and attaches the resolved project', async () => {
    const request: TestRequest = {
      headers: {
        'x-api-key': ['project-api-key', 'ignored-key'],
      },
    };
    const project = {
      id: 'project-1',
      apiKey: 'project-api-key',
      name: 'Observatory',
    };

    projectsService.findByApiKey.mockResolvedValue(project);

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);

    expect(projectsService.findByApiKey.mock.calls).toEqual([
      ['project-api-key'],
    ]);
    expect(request.project).toEqual(project);
  });
});
