import { AnomaliesService } from './anomalies.service';

describe('AnomaliesService', () => {
  let service: AnomaliesService;
  let prisma: {
    anomaly: {
      findMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      anomaly: {
        findMany: jest.fn(),
      },
    };

    service = new AnomaliesService(prisma as never);
  });

  it('returns anomaly history ordered by detection time descending and capped at 100', async () => {
    await service.getHistory('project-1');

    expect(prisma.anomaly.findMany).toHaveBeenCalledWith({
      where: { projectId: 'project-1' },
      orderBy: { detectedAt: 'desc' },
      take: 100,
    });
  });

  it('returns active anomalies ordered by detection time descending', async () => {
    await service.getActive('project-1');

    expect(prisma.anomaly.findMany).toHaveBeenCalledWith({
      where: {
        projectId: 'project-1',
        resolved: false,
      },
      orderBy: { detectedAt: 'desc' },
    });
  });
});
