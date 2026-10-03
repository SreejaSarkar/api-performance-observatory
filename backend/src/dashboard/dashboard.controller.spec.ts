import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let dashboardService: jest.Mocked<DashboardService>;

  const request = {
    project: {
      id: 'project-1',
    },
  } as unknown as Parameters<DashboardController['getDashboard']>[0];

  beforeEach(() => {
    dashboardService = {
      getDashboard: jest.fn(),
    } as unknown as jest.Mocked<DashboardService>;

    controller = new DashboardController(dashboardService);
  });

  it('returns dashboard data for the request project and requested hours', async () => {
    const result = { summary: { requests: 100 } };
    dashboardService.getDashboard.mockResolvedValue(result as never);

    await expect(controller.getDashboard(request, '24')).resolves.toBe(result);

    expect(dashboardService.getDashboard.mock.calls).toEqual([
      ['project-1', 24],
    ]);
  });

  it('defaults hours to 72 when hours are omitted', async () => {
    dashboardService.getDashboard.mockResolvedValue({} as never);

    await controller.getDashboard(request);

    expect(dashboardService.getDashboard.mock.calls).toEqual([
      ['project-1', 72],
    ]);
  });

  it('defaults hours to 72 when the query value is not numeric', async () => {
    dashboardService.getDashboard.mockResolvedValue({} as never);

    await controller.getDashboard(request, 'invalid');

    expect(dashboardService.getDashboard.mock.calls).toEqual([
      ['project-1', 72],
    ]);
  });
});
