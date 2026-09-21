import { Injectable } from '@nestjs/common';

import { MetricsService } from '../metrics/metrics.service';
import { AlertsService } from '../alerts/alerts.service';
import { AnomaliesService } from '../anomalies/anomalies.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly alertsService: AlertsService,
    private readonly anomaliesService: AnomaliesService,
  ) {}

  async getDashboard(projectId: string, hours = 72) {
    const [
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
      recentAlerts,
      comparison,
    ] = await Promise.all([
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
      generatedAt: new Date(),
    };
  }
}
