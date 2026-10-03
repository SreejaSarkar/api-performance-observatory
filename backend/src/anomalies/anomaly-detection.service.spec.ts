import { AnomalyDetectionService } from './anomaly-detection.service';

type EndpointBaselineUpsertArg = {
  where: {
    projectId_endpoint: {
      projectId: string;
      endpoint: string;
    };
  };
  create: {
    projectId: string;
    endpoint: string;
    avgLatency: number;
    stdDevLatency: number;
    avgErrorRate: number;
    avgRequests: number;
    sampleCount: number;
  };
  update: {
    avgLatency: number;
    stdDevLatency: number;
    avgErrorRate: number;
    avgRequests: number;
    sampleCount: number;
    calculatedAt: Date;
  };
};

type AnomalyCreateArg = {
  data: {
    projectId: string;
    endpoint: string;
    type: string;
    severity: string;
    value: number;
    threshold: number;
  };
};

type AnomalyUpdateManyArg = {
  where: {
    projectId: string;
    endpoint: string;
    type: string;
    resolved: boolean;
  };
  data: {
    resolved: boolean;
    resolvedAt: Date;
  };
};

describe('AnomalyDetectionService', () => {
  let service: AnomalyDetectionService;
  let prisma: {
    project: {
      findMany: jest.Mock;
    };
    apiMetric: {
      findMany: jest.Mock;
    };
    endpointBaseline: {
      findMany: jest.Mock;
      upsert: jest.Mock;
    };
    anomaly: {
      findFirst: jest.Mock;
      create: jest.Mock;
      updateMany: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      project: {
        findMany: jest.fn(),
      },
      apiMetric: {
        findMany: jest.fn(),
      },
      endpointBaseline: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      anomaly: {
        findFirst: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    service = new AnomalyDetectionService(prisma as never);
  });

  it('runs detection for every project and logs failures per project', async () => {
    prisma.project.findMany.mockResolvedValue([
      { id: 'project-1' },
      { id: 'project-2' },
    ]);
    const detectSpy = jest
      .spyOn(service, 'detectAnomalies')
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('boom'));
    const errorSpy = jest
      .spyOn(
        (
          service as unknown as {
            logger: { error: (...args: unknown[]) => void };
          }
        ).logger,
        'error',
      )
      .mockImplementation(() => undefined);
    const logSpy = jest
      .spyOn(
        (
          service as unknown as {
            logger: { log: (...args: unknown[]) => void };
          }
        ).logger,
        'log',
      )
      .mockImplementation(() => undefined);

    await service.runDetection();

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      select: { id: true },
    });
    expect(detectSpy).toHaveBeenCalledWith('project-1');
    expect(detectSpy).toHaveBeenCalledWith('project-2');
    expect(errorSpy).toHaveBeenCalledWith(
      'Detection failed for project project-2',
      expect.any(Error),
    );
    expect(logSpy).toHaveBeenCalledWith('Running anomaly detection...');
  });

  it('runs baseline updates for every project and logs failures per project', async () => {
    prisma.project.findMany.mockResolvedValue([
      { id: 'project-1' },
      { id: 'project-2' },
    ]);
    const updateSpy = jest
      .spyOn(service, 'updateBaselines')
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('baseline failure'));
    const errorSpy = jest
      .spyOn(
        (
          service as unknown as {
            logger: { error: (...args: unknown[]) => void };
          }
        ).logger,
        'error',
      )
      .mockImplementation(() => undefined);

    await service.runBaselineUpdate();

    expect(updateSpy).toHaveBeenCalledWith('project-1');
    expect(updateSpy).toHaveBeenCalledWith('project-2');
    expect(errorSpy).toHaveBeenCalledWith(
      'Baseline update failed for project project-2',
      expect.any(Error),
    );
  });

  it('does nothing when updating baselines without recent metrics', async () => {
    prisma.apiMetric.findMany.mockResolvedValue([]);

    await service.updateBaselines('project-1');

    expect(prisma.endpointBaseline.upsert).not.toHaveBeenCalled();
  });

  it('aggregates recent metrics into endpoint baselines', async () => {
    prisma.apiMetric.findMany.mockResolvedValue([
      {
        endpoint: '/checkout',
        latency: 100,
        requests: 10,
        statusCode: 200,
      },
      {
        endpoint: '/checkout',
        latency: 200,
        requests: 30,
        statusCode: 500,
      },
    ]);

    await service.updateBaselines('project-1');

    expect(prisma.endpointBaseline.upsert).toHaveBeenCalledTimes(1);
    const [baselineUpsertArg] = prisma.endpointBaseline.upsert.mock
      .calls[0] as [EndpointBaselineUpsertArg];

    expect(baselineUpsertArg.where).toEqual({
      projectId_endpoint: {
        projectId: 'project-1',
        endpoint: '/checkout',
      },
    });
    expect(baselineUpsertArg.create).toEqual({
      projectId: 'project-1',
      endpoint: '/checkout',
      avgLatency: 150,
      stdDevLatency: 50,
      avgErrorRate: 50,
      avgRequests: 20,
      sampleCount: 2,
    });
    expect(baselineUpsertArg.update.avgLatency).toBe(150);
    expect(baselineUpsertArg.update.stdDevLatency).toBe(50);
    expect(baselineUpsertArg.update.avgErrorRate).toBe(50);
    expect(baselineUpsertArg.update.avgRequests).toBe(20);
    expect(baselineUpsertArg.update.sampleCount).toBe(2);
    expect(baselineUpsertArg.update.calculatedAt).toBeInstanceOf(Date);
  });

  it('bootstraps baselines when anomaly detection has no stored baselines', async () => {
    prisma.endpointBaseline.findMany.mockResolvedValue([]);
    const updateSpy = jest
      .spyOn(service, 'updateBaselines')
      .mockResolvedValue(undefined);

    await service.detectAnomalies('project-1');

    expect(updateSpy).toHaveBeenCalledWith('project-1');
    expect(prisma.apiMetric.findMany).not.toHaveBeenCalled();
  });

  it('returns early when anomaly detection has no recent metrics', async () => {
    prisma.endpointBaseline.findMany.mockResolvedValue([
      {
        endpoint: '/checkout',
        avgLatency: 100,
        stdDevLatency: 10,
        avgErrorRate: 5,
        avgRequests: 20,
        sampleCount: 100,
      },
    ]);
    prisma.apiMetric.findMany.mockResolvedValue([]);

    await service.detectAnomalies('project-1');

    expect(prisma.anomaly.create).not.toHaveBeenCalled();
    expect(prisma.anomaly.updateMany).not.toHaveBeenCalled();
  });

  it('creates new anomalies and resolves recovered ones', async () => {
    prisma.endpointBaseline.findMany.mockResolvedValue([
      {
        endpoint: '/checkout',
        avgLatency: 100,
        stdDevLatency: 10,
        avgErrorRate: 5,
        avgRequests: 20,
        sampleCount: 100,
      },
      {
        endpoint: '/search',
        avgLatency: 80,
        stdDevLatency: 5,
        avgErrorRate: 1,
        avgRequests: 25,
        sampleCount: 100,
      },
    ]);
    prisma.apiMetric.findMany.mockResolvedValue([
      {
        endpoint: '/checkout',
        latency: 140,
        requests: 130,
        statusCode: 500,
      },
      {
        endpoint: '/checkout',
        latency: 145,
        requests: 130,
        statusCode: 500,
      },
      {
        endpoint: '/search',
        latency: 82,
        requests: 2,
        statusCode: 200,
      },
    ]);
    prisma.anomaly.findFirst.mockResolvedValue(null);
    prisma.anomaly.create.mockResolvedValue(undefined);
    prisma.anomaly.updateMany.mockResolvedValue({ count: 1 });
    const logSpy = jest
      .spyOn(
        (
          service as unknown as {
            logger: { log: (...args: unknown[]) => void };
          }
        ).logger,
        'log',
      )
      .mockImplementation(() => undefined);

    await service.detectAnomalies('project-1');

    expect(prisma.anomaly.create).toHaveBeenCalledTimes(4);
    const createdAnomalies = (
      prisma.anomaly.create.mock.calls as [AnomalyCreateArg][]
    ).map(([callArg]) => callArg.data);

    expect(createdAnomalies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          projectId: 'project-1',
          endpoint: '/checkout',
          type: 'LATENCY_SPIKE',
          severity: 'CRITICAL',
        }),
        expect.objectContaining({
          projectId: 'project-1',
          endpoint: '/checkout',
          type: 'ERROR_SPIKE',
          severity: 'CRITICAL',
        }),
        expect.objectContaining({
          projectId: 'project-1',
          endpoint: '/checkout',
          type: 'TRAFFIC_SPIKE',
          severity: 'CRITICAL',
        }),
        expect.objectContaining({
          projectId: 'project-1',
          endpoint: '/search',
          type: 'TRAFFIC_DROP',
          severity: 'CRITICAL',
        }),
      ]),
    );

    const resolvedRecoveryCall = (
      prisma.anomaly.updateMany.mock.calls as [AnomalyUpdateManyArg][]
    ).find(
      ([callArg]) =>
        callArg.where.projectId === 'project-1' &&
        callArg.where.endpoint === '/search' &&
        callArg.where.type === 'LATENCY_SPIKE' &&
        callArg.where.resolved === false,
    );

    expect(resolvedRecoveryCall).toBeDefined();
    expect(resolvedRecoveryCall?.[0].data.resolved).toBe(true);
    expect(resolvedRecoveryCall?.[0].data.resolvedAt).toBeInstanceOf(Date);
    expect(logSpy).toHaveBeenCalledWith(
      'Detection complete for project project-1: 4 new anomalies',
    );
  });

  it('skips creating anomalies when an unresolved duplicate already exists', async () => {
    prisma.endpointBaseline.findMany.mockResolvedValue([
      {
        endpoint: '/checkout',
        avgLatency: 100,
        stdDevLatency: 10,
        avgErrorRate: 5,
        avgRequests: 20,
        sampleCount: 100,
      },
    ]);
    prisma.apiMetric.findMany.mockResolvedValue([
      {
        endpoint: '/checkout',
        latency: 145,
        requests: 130,
        statusCode: 500,
      },
      {
        endpoint: '/checkout',
        latency: 145,
        requests: 130,
        statusCode: 500,
      },
    ]);
    prisma.anomaly.findFirst.mockResolvedValue({ id: 'existing-anomaly' });

    await service.detectAnomalies('project-1');

    expect(prisma.anomaly.create).not.toHaveBeenCalled();
  });
});
