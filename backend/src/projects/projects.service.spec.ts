import { ProjectRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from './projects.service';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

const { randomUUID: mockRandomUUID }: { randomUUID: jest.Mock<string, []> } =
  jest.requireMock('crypto');

type PrismaMocks = {
  project: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaMocks;

  beforeEach(() => {
    prisma = {
      project: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    mockRandomUUID.mockReset();

    service = new ProjectsService(prisma as unknown as PrismaService);
  });

  it('creates a project with a generated api key and owner membership', async () => {
    const createdProject = {
      id: 'project-1',
      name: 'Payments Service',
      apiKey: 'generated-api-key',
      memberships: [
        {
          role: ProjectRole.OWNER,
          userId: 'user-1',
        },
      ],
    };

    mockRandomUUID.mockReturnValue('generated-api-key');
    prisma.project.create.mockResolvedValue(createdProject);

    await expect(service.create('Payments Service', 'user-1')).resolves.toEqual(
      createdProject,
    );

    expect(prisma.project.create.mock.calls).toEqual([
      [
        {
          data: {
            name: 'Payments Service',
            apiKey: 'generated-api-key',
            memberships: {
              create: {
                userId: 'user-1',
                role: ProjectRole.OWNER,
              },
            },
          },
          include: {
            memberships: true,
          },
        },
      ],
    ]);
  });

  it('looks up a project by api key', async () => {
    const project = {
      id: 'project-1',
      apiKey: 'project-api-key',
    };

    prisma.project.findUnique.mockResolvedValue(project);

    await expect(service.findByApiKey('project-api-key')).resolves.toEqual(
      project,
    );

    expect(prisma.project.findUnique.mock.calls).toEqual([
      [
        {
          where: {
            apiKey: 'project-api-key',
          },
        },
      ],
    ]);
  });

  it('returns projects visible to the user ordered by creation date', async () => {
    const projects = [
      {
        id: 'project-1',
        name: 'Payments Service',
      },
    ];

    prisma.project.findMany.mockResolvedValue(projects);

    await expect(service.findAllForUser('user-1')).resolves.toEqual(projects);

    expect(prisma.project.findMany.mock.calls).toEqual([
      [
        {
          where: {
            memberships: {
              some: {
                userId: 'user-1',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            memberships: {
              where: {
                userId: 'user-1',
              },
              select: {
                role: true,
              },
            },
          },
        },
      ],
    ]);
  });
});
