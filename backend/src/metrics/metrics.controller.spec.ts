import { MetricsController } from './metrics.controller';
import { QueryWindowDto } from './dto/query-window.dto';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;
  let metricsService: jest.Mocked<MetricsService>;

  const request = {
    project: {
      id: 'project-1',
    },
  } as unknown as Parameters<MetricsController['getSummary']>[0];

  const query: QueryWindowDto = {
    hours: 24,
  };

  beforeEach(() => {
    metricsService = {
      getSummary: jest.fn(),
      getTrend: jest.fn(),
      getEndpointAnalytics: jest.fn(),
      getErrors: jest.fn(),
      getTraffic: jest.fn(),
      getSlowEndpoints: jest.fn(),
      getAnomalies: jest.fn(),
      getServiceHealth: jest.fn(),
      getSla: jest.fn(),
      getCostEstimation: jest.fn(),
      getTopFailures: jest.fn(),
      getLatencyDistribution: jest.fn(),
      getComparison: jest.fn(),
      getEndpointDetail: jest.fn(),
    } as unknown as jest.Mocked<MetricsService>;

    controller = new MetricsController(metricsService);
  });

  it('delegates summary queries to the metrics service', async () => {
    await controller.getSummary(request, query);

    expect(metricsService.getSummary.mock.calls).toEqual([['project-1', 24]]);
  });

  it('delegates trend queries to the metrics service', async () => {
    await controller.getTrend(request, query);

    expect(metricsService.getTrend.mock.calls).toEqual([['project-1', 24]]);
  });

  it('delegates endpoint analytics queries to the metrics service', async () => {
    await controller.getEndpoints(request, query);

    expect(metricsService.getEndpointAnalytics.mock.calls).toEqual([
      ['project-1', 24],
    ]);
  });

  it('delegates error queries to the metrics service', async () => {
    await controller.getErrors(request, query);

    expect(metricsService.getErrors.mock.calls).toEqual([['project-1', 24]]);
  });

  it('delegates traffic queries to the metrics service', async () => {
    await controller.getTraffic(request, query);

    expect(metricsService.getTraffic.mock.calls).toEqual([['project-1', 24]]);
  });

  it('delegates slow endpoint queries to the metrics service', async () => {
    await controller.getSlowEndpoints(request, query);

    expect(metricsService.getSlowEndpoints.mock.calls).toEqual([
      ['project-1', 24],
    ]);
  });

  it('delegates anomaly queries to the metrics service', async () => {
    await controller.getAnomalies(request, query);

    expect(metricsService.getAnomalies.mock.calls).toEqual([['project-1', 24]]);
  });

  it('delegates service health queries to the metrics service', async () => {
    await controller.getServiceHealth(request, query);

    expect(metricsService.getServiceHealth.mock.calls).toEqual([
      ['project-1', 24],
    ]);
  });

  it('delegates sla queries to the metrics service', async () => {
    await controller.getSla(request, query);

    expect(metricsService.getSla.mock.calls).toEqual([['project-1', 24]]);
  });

  it('delegates cost estimation queries to the metrics service', async () => {
    await controller.getCostEstimation(request, query);

    expect(metricsService.getCostEstimation.mock.calls).toEqual([
      ['project-1', 24],
    ]);
  });

  it('delegates top failures queries using the request project', async () => {
    await controller.getTopFailures(request as never);

    expect(metricsService.getTopFailures.mock.calls).toEqual([['project-1']]);
  });

  it('delegates latency distribution queries using the request project', async () => {
    await controller.getLatencyDistribution(request as never);

    expect(metricsService.getLatencyDistribution.mock.calls).toEqual([
      ['project-1'],
    ]);
  });

  it('delegates comparison queries to the metrics service', async () => {
    await controller.getComparison(request, query);

    expect(metricsService.getComparison.mock.calls).toEqual([
      ['project-1', 24],
    ]);
  });

  it('decodes endpoint details before delegating to the metrics service', async () => {
    await controller.getEndpointDetail(request, '%2Fcheckout%2Fv1', query);

    expect(metricsService.getEndpointDetail.mock.calls).toEqual([
      ['project-1', '/checkout/v1', 24],
    ]);
  });
});
