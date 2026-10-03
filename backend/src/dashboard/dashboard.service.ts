import { Injectable } from '@nestjs/common';

import { MetricsService } from '../metrics/metrics.service';
import { AlertsService } from '../alerts/alerts.service';
import { AnomaliesService } from '../anomalies/anomalies.service';

type DashboardResponse = {
  summary: unknown;
  health: unknown;
  sla: unknown;
  alerts: unknown;
  anomalies: unknown;
  topFailures: unknown;
  trend: unknown;
  traffic: unknown;
  latencyDistribution: unknown;
  slowEndpoints: unknown;
  recentAlerts: unknown[];
  comparison: unknown;
  generatedAt: Date;
};

type DashboardDataTuple = [
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown[],
  unknown,
];

@Injectable()
export class DashboardService {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly alertsService: AlertsService,
    private readonly anomaliesService: AnomaliesService,
  ) {}

  async getDashboard(
    projectId: string,
    hours = 72,
  ): Promise<DashboardResponse> {
    const dashboardData: DashboardDataTuple = await Promise.all([
      this.metricsService.getSummary(projectId, hours),

      this.metricsService.getServiceHealth(projectId, hours),

      this.metricsService.getSla(projectId, hours),

      this.alertsService.getStats(projectId),

      this.anomaliesService.getActive(projectId),

      this.metricsService.getTopFailures(projectId, hours),

      this.metricsService.getTrend(projectId, hours),

      this.metricsService.getTraffic(projectId, hours),

      this.metricsService.getLatencyDistribution(projectId, hours),

      this.metricsService.getSlowEndpoints(projectId, hours),

      this.alertsService.getEvents(projectId),

      this.metricsService.getComparison(projectId, hours),
    ] as const);

    return {
      summary: dashboardData[0],
      health: dashboardData[1],
      sla: dashboardData[2],
      alerts: dashboardData[3],
      anomalies: dashboardData[4],
      topFailures: dashboardData[5],
      trend: dashboardData[6],
      traffic: dashboardData[7],
      latencyDistribution: dashboardData[8],
      slowEndpoints: dashboardData[9],
      recentAlerts: dashboardData[10].slice(0, 5),
      comparison: dashboardData[11],
      generatedAt: new Date(),
    };
  }
}
