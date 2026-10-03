import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsService: jest.Mocked<ProjectsService>;

  beforeEach(() => {
    projectsService = {
      create: jest.fn(),
      findAllForUser: jest.fn(),
    } as unknown as jest.Mocked<ProjectsService>;

    controller = new ProjectsController(projectsService);
  });

  it('creates a project for the current user', async () => {
    const dto: CreateProjectDto = {
      name: 'Payments Service',
    };

    await controller.create(dto, {
      userId: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    });

    expect(projectsService.create.mock.calls).toEqual([
      ['Payments Service', 'user-1'],
    ]);
  });

  it('returns projects for the current user', async () => {
    await controller.findAll({
      userId: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    });

    expect(projectsService.findAllForUser.mock.calls).toEqual([['user-1']]);
  });
});
