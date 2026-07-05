import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 */5 * * * *')
  async runDetection() {
    this.logger.log('Running anomaly detection...');
    const projects = await this.prisma.project.findMany({
      select: { id: true },
    });

    for (const project of projects) {
      try {
        await this.detectAnomalies(project.id);
      } catch (error) {
        this.logger.error(
          `Detection failed for project ${project.id}`,
          error,
        );
      }
    }
  }

  @Cron('0 0 * * * *')
  async runBaselineUpdate() {
    this.logger.log('Updating endpoint baselines...');
    const projects = await this.prisma.project.findMany({
      select: { id: true },
    });

    for (const project of projects) {
      try {
        await this.updateBaselines(project.id);
      } catch (error) {
        this.logger.error(
          `Baseline update failed for project ${project.id}`,
          error,
        );
      }
    }
  }

  async updateBaselines(projectId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const metrics = await this.prisma.apiMetric.findMany({
      where: {
        projectId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        endpoint: true,
        latency: true,
        requests: true,
        statusCode: true,
      },
    });

    if (!metrics.length) return;

    const endpointMap = new Map<
      string,
      { latencies: number[]; requests: number; errors: number; total: number }
    >();

    for (const metric of metrics) {
      const existing = endpointMap.get(metric.endpoint);
      if (existing) {
        existing.latencies.push(metric.latency);
        existing.requests += metric.requests;
        existing.total++;
        if (metric.statusCode >= 400) existing.errors++;
      } else {
        endpointMap.set(metric.endpoint, {
          latencies: [metric.latency],
          requests: metric.requests,
          total: 1,
          errors: metric.statusCode >= 400 ? 1 : 0,
        });
      }
    }

    for (const [endpoint, data] of endpointMap.entries()) {
      const avgLatency =
        data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length;
      const stdDevLatency = this.calculateStdDev(data.latencies, avgLatency);
      const avgErrorRate = (data.errors / data.total) * 100;
      const avgRequests = data.requests / data.total;

      await this.prisma.endpointBaseline.upsert({
        where: {
          projectId_endpoint: { projectId, endpoint },
        },
        create: {
          projectId,
          endpoint,
          avgLatency,
          stdDevLatency,
          avgErrorRate,
          avgRequests,
          sampleCount: data.total,
        },
        update: {
          avgLatency,
          stdDevLatency,
          avgErrorRate,
          avgRequests,
          sampleCount: data.total,
          calculatedAt: new Date(),
        },
      });
    }

    this.logger.log(
      `Updated baselines for ${endpointMap.size} endpoints (project ${projectId})`,
    );
  }

  async detectAnomalies(projectId: string) {
    const baselines = await this.prisma.endpointBaseline.findMany({
      where: { projectId },
    });

    if (!baselines.length) {
      // No baselines yet — run initial baseline calculation
      await this.updateBaselines(projectId);
      return;
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentMetrics = await this.prisma.apiMetric.findMany({
      where: {
        projectId,
        createdAt: { gte: tenMinutesAgo },
      },
      select: {
        endpoint: true,
        latency: true,
        requests: true,
        statusCode: true,
      },
    });

    if (!recentMetrics.length) return;

    // Group recent metrics by endpoint
    const recentMap = new Map<
      string,
      { latencies: number[]; requests: number; errors: number; total: number }
    >();

    for (const metric of recentMetrics) {
      const existing = recentMap.get(metric.endpoint);
      if (existing) {
        existing.latencies.push(metric.latency);
        existing.requests += metric.requests;
        existing.total++;
        if (metric.statusCode >= 400) existing.errors++;
      } else {
        recentMap.set(metric.endpoint, {
          latencies: [metric.latency],
          requests: metric.requests,
          total: 1,
          errors: metric.statusCode >= 400 ? 1 : 0,
        });
      }
    }

    const baselineMap = new Map(
      baselines.map((b) => [b.endpoint, b]),
    );

    const newAnomalies: {
      type: string;
      endpoint: string;
      value: number;
      threshold: number;
      severity: string;
    }[] = [];

    const resolvedEndpoints: { endpoint: string; type: string }[] = [];

    for (const [endpoint, recent] of recentMap.entries()) {
      const baseline = baselineMap.get(endpoint);
      if (!baseline) continue;

      const avgLatency =
        recent.latencies.reduce((a, b) => a + b, 0) /
        recent.latencies.length;
      const errorRate = (recent.errors / recent.total) * 100;
      const requestVolume = recent.requests;

      // LATENCY_SPIKE detection
      const latencyThreshold2 =
        baseline.avgLatency + 2 * baseline.stdDevLatency;
      const latencyThreshold3 =
        baseline.avgLatency + 3 * baseline.stdDevLatency;

      if (baseline.stdDevLatency > 0 && avgLatency > latencyThreshold3) {
        newAnomalies.push({
          type: 'LATENCY_SPIKE',
          endpoint,
          value: Math.round(avgLatency),
          threshold: Math.round(latencyThreshold3),
          severity: 'CRITICAL',
        });
      } else if (
        baseline.stdDevLatency > 0 &&
        avgLatency > latencyThreshold2
      ) {
        newAnomalies.push({
          type: 'LATENCY_SPIKE',
          endpoint,
          value: Math.round(avgLatency),
          threshold: Math.round(latencyThreshold2),
          severity: 'WARNING',
        });
      } else {
        resolvedEndpoints.push({ endpoint, type: 'LATENCY_SPIKE' });
      }

      // ERROR_SPIKE detection
      const errorThresholdWarning = baseline.avgErrorRate + 15;
      const errorThresholdCritical = baseline.avgErrorRate + 30;

      if (errorRate > errorThresholdCritical) {
        newAnomalies.push({
          type: 'ERROR_SPIKE',
          endpoint,
          value: Number(errorRate.toFixed(2)),
          threshold: Number(errorThresholdCritical.toFixed(2)),
          severity: 'CRITICAL',
        });
      } else if (errorRate > errorThresholdWarning) {
        newAnomalies.push({
          type: 'ERROR_SPIKE',
          endpoint,
          value: Number(errorRate.toFixed(2)),
          threshold: Number(errorThresholdWarning.toFixed(2)),
          severity: 'WARNING',
        });
      } else {
        resolvedEndpoints.push({ endpoint, type: 'ERROR_SPIKE' });
      }

      // TRAFFIC_SPIKE detection
      if (requestVolume > baseline.avgRequests * 5) {
        newAnomalies.push({
          type: 'TRAFFIC_SPIKE',
          endpoint,
          value: requestVolume,
          threshold: Math.round(baseline.avgRequests * 5),
          severity: 'CRITICAL',
        });
      } else if (requestVolume > baseline.avgRequests * 3) {
        newAnomalies.push({
          type: 'TRAFFIC_SPIKE',
          endpoint,
          value: requestVolume,
          threshold: Math.round(baseline.avgRequests * 3),
          severity: 'WARNING',
        });
      } else {
        resolvedEndpoints.push({ endpoint, type: 'TRAFFIC_SPIKE' });
      }

      // TRAFFIC_DROP detection (only if enough historical data)
      if (
        baseline.sampleCount > 50 &&
        requestVolume < baseline.avgRequests * 0.2
      ) {
        newAnomalies.push({
          type: 'TRAFFIC_DROP',
          endpoint,
          value: requestVolume,
          threshold: Math.round(baseline.avgRequests * 0.2),
          severity: 'CRITICAL',
        });
      } else {
        resolvedEndpoints.push({ endpoint, type: 'TRAFFIC_DROP' });
      }
    }

    // Deduplication: only insert anomalies that don't already have an unresolved entry
    for (const anomaly of newAnomalies) {
      const existing = await this.prisma.anomaly.findFirst({
        where: {
          projectId,
          endpoint: anomaly.endpoint,
          type: anomaly.type,
          resolved: false,
        },
      });

      if (!existing) {
        await this.prisma.anomaly.create({
          data: {
            projectId,
            type: anomaly.type,
            endpoint: anomaly.endpoint,
            value: anomaly.value,
            threshold: anomaly.threshold,
            severity: anomaly.severity,
          },
        });
      }
    }

    // Auto-resolve anomalies that are back to normal
    for (const { endpoint, type } of resolvedEndpoints) {
      await this.prisma.anomaly.updateMany({
        where: {
          projectId,
          endpoint,
          type,
          resolved: false,
        },
        data: {
          resolved: true,
          resolvedAt: new Date(),
        },
      });
    }

    this.logger.log(
      `Detection complete for project ${projectId}: ${newAnomalies.length} new anomalies`,
    );
  }

  private calculateStdDev(values: number[], mean: number): number {
    if (values.length <= 1) return 0;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance);
  }
}
