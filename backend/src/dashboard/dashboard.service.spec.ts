import { AlertsService } from '../alerts/alerts.service';
import { AnomaliesService } from '../anomalies/anomalies.service';
import { MetricsService } from '../metrics/metrics.service';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let metricsService: jest.Mocked<MetricsService>;
  let alertsService: jest.Mocked<AlertsService>;
  let anomaliesService: jest.Mocked<AnomaliesService>;

  beforeEach(() => {
    metricsService = {
      getSummary: jest.fn(),
      getServiceHealth: jest.fn(),
      getSla: jest.fn(),
      getTopFailures: jest.fn(),
      getTrend: jest.fn(),
      getTraffic: jest.fn(),
      getLatencyDistribution: jest.fn(),
      getSlowEndpoints: jest.fn(),
      getComparison: jest.fn(),
    } as unknown as jest.Mocked<MetricsService>;

    alertsService = {
      getStats: jest.fn(),
      getEvents: jest.fn(),
    } as unknown as jest.Mocked<AlertsService>;

    anomaliesService = {
      getActive: jest.fn(),
    } as unknown as jest.Mocked<AnomaliesService>;

    service = new DashboardService(
      metricsService,
      alertsService,
      anomaliesService,
    );
  });

  it('aggregates dashboard data across services and limits recent alerts to five items', async () => {
    const summary = { requests: 120, avgLatency: 95 };
    const health = { status: 'HEALTHY' };
    const sla = { availability: 99.9 };
    const alerts = { total: 7, unresolved: 2 };
    const anomalies = [{ id: 'anomaly-1' }];
    const topFailures = [{ endpoint: '/checkout', errorRate: 12 }];
    const trend = [{ timestamp: '2026-09-29T00:00:00.000Z', requests: 30 }];
    const traffic = [{ endpoint: '/checkout', requests: 80 }];
    const latencyDistribution = [{ bucket: '100-200', count: 5 }];
    const slowEndpoints = [{ endpoint: '/checkout', avgLatency: 320 }];
    const recentAlerts = Array.from({ length: 7 }, (_, index) => ({
      id: `alert-${index + 1}`,
    }));
    const comparison = { requestsChange: 14 };

    metricsService.getSummary.mockResolvedValue(summary);
    metricsService.getServiceHealth.mockResolvedValue(health);
    metricsService.getSla.mockResolvedValue(sla);
    alertsService.getStats.mockResolvedValue(alerts as never);
    anomaliesService.getActive.mockResolvedValue(anomalies as never);
    metricsService.getTopFailures.mockResolvedValue(topFailures);
    metricsService.getTrend.mockResolvedValue(trend);
    metricsService.getTraffic.mockResolvedValue(traffic);
    metricsService.getLatencyDistribution.mockResolvedValue(
      latencyDistribution,
    );
    metricsService.getSlowEndpoints.mockResolvedValue(slowEndpoints);
    alertsService.getEvents.mockResolvedValue(recentAlerts as never);
    metricsService.getComparison.mockResolvedValue(comparison);

    const result = await service.getDashboard('project-1', 24);

    expect(metricsService.getSummary.mock.calls).toEqual([['project-1', 24]]);
    expect(metricsService.getServiceHealth.mock.calls).toEqual([
      ['project-1', 24],
    ]);
    expect(metricsService.getSla.mock.calls).toEqual([['project-1', 24]]);
    expect(alertsService.getStats.mock.calls).toEqual([['project-1']]);
    expect(anomaliesService.getActive.mock.calls).toEqual([['project-1']]);
    expect(metricsService.getTopFailures.mock.calls).toEqual([
      ['project-1', 24],
    ]);
    expect(metricsService.getTrend.mock.calls).toEqual([['project-1', 24]]);
    expect(metricsService.getTraffic.mock.calls).toEqual([['project-1', 24]]);
    expect(metricsService.getLatencyDistribution.mock.calls).toEqual([
      ['project-1', 24],
    ]);
    expect(metricsService.getSlowEndpoints.mock.calls).toEqual([
      ['project-1', 24],
    ]);
    expect(alertsService.getEvents.mock.calls).toEqual([['project-1']]);
    expect(metricsService.getComparison.mock.calls).toEqual([
      ['project-1', 24],
    ]);

    expect(result).toMatchObject({
      summary,
      health,
      sla,
      alerts,
      anomalies,
      topFailures,
      trend,
      traffic,
      latencyDistribution,
      slowEndpoints,
      recentAlerts: recentAlerts.slice(0, 5),
      comparison,
    });
    expect(result.generatedAt).toBeInstanceOf(Date);
  });

  it('uses the default 72-hour window when hours are omitted', async () => {
    metricsService.getSummary.mockResolvedValue({});
    metricsService.getServiceHealth.mockResolvedValue({});
    metricsService.getSla.mockResolvedValue({});
    alertsService.getStats.mockResolvedValue({} as never);
    anomaliesService.getActive.mockResolvedValue([] as never);
    metricsService.getTopFailures.mockResolvedValue([] as never);
    metricsService.getTrend.mockResolvedValue([] as never);
    metricsService.getTraffic.mockResolvedValue([] as never);
    metricsService.getLatencyDistribution.mockResolvedValue([] as never);
    metricsService.getSlowEndpoints.mockResolvedValue([] as never);
    alertsService.getEvents.mockResolvedValue([] as never);
    metricsService.getComparison.mockResolvedValue({});

    await service.getDashboard('project-2');

    expect(metricsService.getSummary.mock.calls).toEqual([['project-2', 72]]);
    expect(metricsService.getComparison.mock.calls).toEqual([
      ['project-2', 72],
    ]);
  });
});
