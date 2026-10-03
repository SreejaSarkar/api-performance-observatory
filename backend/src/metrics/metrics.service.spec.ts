import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  const projectId = 'project-1';

  const createService = () => {
    const prisma = {
      apiMetric: {
        create: jest.fn(),
        createMany: jest.fn(),
        aggregate: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const redisService = {
      get: jest.fn(),
      set: jest.fn(),
      delByPrefix: jest.fn(),
    };

    const metricsGateway = {
      emitMetric: jest.fn(),
    };

    const service = new MetricsService(
      prisma as never,
      redisService as never,
      metricsGateway as never,
    );

    return {
      service,
      prisma,
      redisService,
      metricsGateway,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('invalidates every cache family only for the updated project when creating a metric', async () => {
    const { service, prisma, redisService, metricsGateway } = createService();
    const metric = { id: 'metric-1' };

    prisma.apiMetric.create.mockResolvedValue(metric);
    redisService.delByPrefix.mockResolvedValue(undefined);

    await service.createMetric(
      {
        endpoint: '/health',
        latency: 120,
        requests: 1,
        statusCode: 200,
      },
      projectId,
    );

    expect(redisService.delByPrefix.mock.calls).toEqual([
      ['metrics-summary:project-1:'],
      ['metrics-trend:project-1:'],
      ['metrics-endpoints:project-1:'],
      ['metrics-errors:project-1:'],
      ['metrics-traffic:project-1:'],
      ['metrics-slow-endpoints:project-1:'],
      ['metrics-anomalies:project-1:'],
      ['metrics-service-health:project-1:'],
      ['metrics-sla:project-1:'],
      ['metrics-cost-estimation:project-1:'],
      ['metrics-top-failures:project-1:'],
      ['metrics-latency-distribution:project-1:'],
      ['metrics-comparison:project-1:'],
      ['metrics-endpoint-detail:project-1:'],
    ]);
    expect(metricsGateway.emitMetric).toHaveBeenCalledWith(projectId, metric);
  });

  it('invalidates the same cache families for batched metric ingestion', async () => {
    const { service, prisma, redisService, metricsGateway } = createService();

    prisma.apiMetric.createMany.mockResolvedValue({ count: 2 });
    redisService.delByPrefix.mockResolvedValue(undefined);

    await service.createMany(
      [
        {
          endpoint: '/health',
          latency: 120,
          requests: 1,
          statusCode: 200,
        },
        {
          endpoint: '/ready',
          latency: 180,
          requests: 1,
          statusCode: 200,
        },
      ],
      projectId,
    );

    expect(redisService.delByPrefix).toHaveBeenCalledTimes(14);
    expect(metricsGateway.emitMetric).toHaveBeenCalledWith(projectId, {
      batch: true,
      count: 2,
    });
  });

  it('caches an empty summary response', async () => {
    const { service, prisma, redisService } = createService();

    redisService.get.mockResolvedValue(null);
    prisma.apiMetric.aggregate
      .mockResolvedValueOnce({
        _avg: { latency: null },
        _sum: { requests: null },
        _count: { id: 0 },
      })
      .mockResolvedValueOnce({
        _sum: { requests: null },
      });

    const summary: unknown = await service.getSummary(projectId, 24);

    expect(summary).toEqual({
      avgLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      requests: 0,
      errorRate: 0,
      periodHours: 24,
    });
    expect(redisService.set).toHaveBeenCalledWith(
      'metrics-summary:project-1:24',
      JSON.stringify(summary),
      60,
    );
  });

  it('caches an empty anomalies response', async () => {
    const { service, prisma, redisService } = createService();

    redisService.get.mockResolvedValue(null);
    prisma.apiMetric.findMany.mockResolvedValue([]);

    const anomalies: unknown = await service.getAnomalies(projectId, 12);

    expect(anomalies).toEqual([]);
    expect(redisService.set).toHaveBeenCalledWith(
      'metrics-anomalies:project-1:12',
      JSON.stringify([]),
      60,
    );
  });

  it('returns cached summary data without hitting prisma', async () => {
    const { service, prisma, redisService } = createService();
    const cachedSummary = {
      avgLatency: 90,
      p95Latency: 120,
      p99Latency: 140,
      requests: 50,
      errorRate: 2,
      periodHours: 6,
    };

    redisService.get.mockResolvedValue(JSON.stringify(cachedSummary));

    await expect(service.getSummary(projectId, 6)).resolves.toEqual(
      cachedSummary,
    );

    expect(prisma.apiMetric.aggregate).not.toHaveBeenCalled();
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('returns and caches an empty endpoint detail response', async () => {
    const { service, prisma, redisService } = createService();

    redisService.get.mockResolvedValue(null);
    prisma.apiMetric.findMany.mockResolvedValue([]);

    const result: unknown = await service.getEndpointDetail(
      projectId,
      '/checkout',
      24,
    );

    expect(result).toEqual({
      endpoint: '/checkout',
      latencyTrend: [],
      errorBreakdown: [],
      methodBreakdown: [],
      environmentBreakdown: [],
      recentSamples: [],
      stats: null,
    });
    expect(redisService.set).toHaveBeenCalledWith(
      'metrics-endpoint-detail:project-1:/checkout:24',
      JSON.stringify(result),
      60,
    );
  });
});
