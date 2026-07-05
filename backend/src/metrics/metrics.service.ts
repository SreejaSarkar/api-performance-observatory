import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

import { CreateMetricDto } from './dto/create-metric.dto';
import { AnomalyDto } from './dto/anomaly.dto';
import { MetricsGateway } from './metrics.gateway';

@Injectable()
export class MetricsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly metricsGateway: MetricsGateway,
  ) {}

  private async getProjectMetrics(projectId: string) {
    return this.prisma.apiMetric.findMany({
      where: {
        projectId,
      },
    });
  }

  async createMetric(dto: CreateMetricDto, projectId: string) {
    const metric = await this.prisma.apiMetric.create({
      data: {
        ...dto,
        projectId,
      },
    });

    await this.invalidateCache();
    this.metricsGateway.emitMetric(projectId, metric);

    return metric;
  }

  async createMany(metrics: CreateMetricDto[], projectId: string) {
    await this.prisma.apiMetric.createMany({
      data: metrics.map((m) => ({
        ...m,
        projectId,
      })),
    });

    await this.invalidateCache();
    this.metricsGateway.emitMetric(projectId, { batch: true, count: metrics.length });

    return { inserted: metrics.length };
  }

  private async invalidateCache() {
    await Promise.all([
      this.redisService.delByPrefix('metrics-summary'),
      this.redisService.delByPrefix('metrics-trend'),
      this.redisService.delByPrefix('metrics-endpoints'),
      this.redisService.delByPrefix('metrics-errors'),
      this.redisService.delByPrefix('metrics-traffic'),
      this.redisService.delByPrefix('metrics-slow-endpoints'),
      this.redisService.delByPrefix('metrics-anomalies'),
      this.redisService.delByPrefix('metrics-service-health'),
      this.redisService.delByPrefix('metrics-sla'),
      this.redisService.delByPrefix('metrics-cost-estimation'),
    ]);
  }

  async getSummary(projectId: string, hours = 72) {
    const cacheKey = `metrics-summary:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const startDate = this.getStartDate(hours);

    const [stats, errorStats] = await Promise.all([
      this.prisma.apiMetric.aggregate({
        where: {
          projectId,
          createdAt: {
            gte: startDate,
          },
        },
        _avg: {
          latency: true,
        },
        _sum: {
          requests: true,
        },
        _count: {
          id: true,
        },
      }),

      this.prisma.apiMetric.aggregate({
        where: {
          projectId,
          createdAt: {
            gte: startDate,
          },
          statusCode: {
            gte: 400,
          },
        },
        _sum: {
          requests: true,
        },
      }),
    ]);

    const total = stats._count.id;

    if (!total) {
      return {
        avgLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        requests: 0,
        errorRate: 0,
        periodHours: hours,
      };
    }

    // Fetch only the P95 and P99 rows using offset (avoids loading all rows)
    const whereClause = { projectId, createdAt: { gte: startDate } };
    const [p95Row, p99Row] = await Promise.all([
      this.prisma.apiMetric.findFirst({
        where: whereClause,
        orderBy: { latency: 'asc' },
        skip: Math.floor(total * 0.95),
        select: { latency: true },
      }),
      this.prisma.apiMetric.findFirst({
        where: whereClause,
        orderBy: { latency: 'asc' },
        skip: Math.floor(total * 0.99),
        select: { latency: true },
      }),
    ]);

    const p95Latency = p95Row?.latency ?? 0;
    const p99Latency = p99Row?.latency ?? 0;

    const totalRequests = stats._sum.requests ?? 0;
    const failedRequests = errorStats._sum.requests ?? 0;
    const errorRate = totalRequests === 0
      ? 0
      : Number(((failedRequests / totalRequests) * 100).toFixed(2));

    const summary = {
      avgLatency: Math.round(stats._avg.latency ?? 0),
      p95Latency,
      p99Latency,
      requests: totalRequests,
      errorRate,
      periodHours: hours,
    };

    await this.redisService.set(cacheKey, JSON.stringify(summary), 60);

    return summary;
  }

  async getTrend(projectId: string, hours = 72) {
    const cacheKey = `metrics-trend:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const metrics = await this.prisma.apiMetric.findMany({
      where: {
        projectId,
        createdAt: {
          gte: this.getStartDate(hours),
        },
      },
      select: {
        createdAt: true,
        latency: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const trend = metrics.map((metric) => ({
      time: metric.createdAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      latency: metric.latency,
    }));

    await this.redisService.set(cacheKey, JSON.stringify(trend), 60);

    return trend;
  }

  async getEndpointAnalytics(projectId: string, hours = 72) {
    const cacheKey = `metrics-endpoints:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const startDate = this.getStartDate(hours);

    const grouped = await this.prisma.apiMetric.groupBy({
      by: ['endpoint'],
      where: {
        projectId,
        createdAt: {
          gte: startDate,
        },
      },
      _avg: {
        latency: true,
      },
      _sum: {
        requests: true,
      },
      _count: {
        id: true,
      },
    });

    const result = await Promise.all(
      grouped.map(async (endpoint) => {
        const errorCount = await this.prisma.apiMetric.count({
          where: {
            projectId,
            endpoint: endpoint.endpoint,
            createdAt: {
              gte: startDate,
            },
            statusCode: {
              gte: 400,
            },
          },
        });

        return {
          endpoint: endpoint.endpoint,

          avgLatency: Math.round(endpoint._avg.latency ?? 0),

          requests: endpoint._sum.requests ?? 0,

          errorRate: Number(
            ((errorCount / endpoint._count.id) * 100).toFixed(2),
          ),
        };
      }),
    );

    result.sort((a, b) => b.avgLatency - a.avgLatency);

    await this.redisService.set(cacheKey, JSON.stringify(result), 60);

    return result;
  }

  async getErrors(projectId: string, hours = 72) {
    const cacheKey = `metrics-errors:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const startDate = this.getStartDate(hours);

    const [success, clientErrors, serverErrors] = await Promise.all([
      this.prisma.apiMetric.count({
        where: {
          projectId,
          createdAt: {
            gte: startDate,
          },
          statusCode: {
            lt: 400,
          },
        },
      }),

      this.prisma.apiMetric.count({
        where: {
          projectId,
          createdAt: {
            gte: startDate,
          },
          statusCode: {
            gte: 400,
            lt: 500,
          },
        },
      }),

      this.prisma.apiMetric.count({
        where: {
          projectId,
          createdAt: {
            gte: startDate,
          },
          statusCode: {
            gte: 500,
          },
        },
      }),
    ]);

    const total = success + clientErrors + serverErrors;

    const errorRate =
      total === 0
        ? 0
        : Number((((clientErrors + serverErrors) / total) * 100).toFixed(2));

    const result = {
      success,
      '4xx': clientErrors,
      '5xx': serverErrors,
      errorRate,
      periodHours: hours,
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 60);

    return result;
  }

  async getTraffic(projectId: string, hours = 72) {
    const cacheKey = `metrics-traffic:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const metrics = await this.prisma.apiMetric.findMany({
      where: {
        projectId,
        createdAt: {
          gte: this.getStartDate(hours),
        },
      },
      select: {
        createdAt: true,
        requests: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by 10-minute buckets
    const bucketMap = new Map<string, number>();

    for (const metric of metrics) {
      const date = new Date(metric.createdAt);
      const minutes = Math.floor(date.getMinutes() / 10) * 10;
      date.setMinutes(minutes, 0, 0);
      const key = date.toISOString();
      bucketMap.set(key, (bucketMap.get(key) || 0) + metric.requests);
    }

    const traffic = Array.from(bucketMap.entries()).map(([time, requests]) => ({
      time: new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      requests,
    }));

    await this.redisService.set(cacheKey, JSON.stringify(traffic), 60);

    return traffic;
  }

  async getSlowEndpoints(projectId: string, hours = 72) {
    const cacheKey = `metrics-slow-endpoints:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const grouped = await this.prisma.apiMetric.groupBy({
      by: ['endpoint'],
      where: {
        projectId,
        createdAt: {
          gte: this.getStartDate(hours),
        },
      },
      _avg: {
        latency: true,
      },
      _sum: {
        requests: true,
      },
    });

    const topSlow = grouped
      .map((item) => ({
        endpoint: item.endpoint,

        avgLatency: Math.round(item._avg.latency ?? 0),

        requests: item._sum.requests ?? 0,
      }))
      .sort((a, b) => b.avgLatency - a.avgLatency)
      .slice(0, 10);

    await this.redisService.set(cacheKey, JSON.stringify(topSlow), 60);

    return topSlow;
  }

  async getAnomalies(projectId: string, hours = 72) {
    const cacheKey = `metrics-anomalies:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const metrics = await this.prisma.apiMetric.findMany({
      where: {
        projectId,
        createdAt: {
          gte: this.getStartDate(hours),
        },
      },
      select: {
        endpoint: true,
        latency: true,
        requests: true,
        statusCode: true,
      },
    });

    if (!metrics.length) {
      return [];
    }

    const anomalies: AnomalyDto[] = [];

    const latencies = metrics.map((metric) => metric.latency);

    const meanLatency = this.calculateMean(latencies);

    const stdDeviation = this.calculateStdDev(latencies, meanLatency);

    const avgRequests =
      metrics.reduce((sum, metric) => sum + metric.requests, 0) /
      metrics.length;

    const endpointMap = new Map<
      string,
      {
        latencies: number[];
        requests: number;
        errors: number;
        total: number;
      }
    >();

    for (const metric of metrics) {
      const existing = endpointMap.get(metric.endpoint);

      if (existing) {
        existing.latencies.push(metric.latency);

        existing.requests += metric.requests;

        existing.total++;

        if (metric.statusCode >= 400) {
          existing.errors++;
        }
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

      const zScore =
        stdDeviation === 0 ? 0 : (avgLatency - meanLatency) / stdDeviation;

      const errorRate = (data.errors / data.total) * 100;

      if (Math.abs(zScore) > 2) {
        anomalies.push({
          type: 'LATENCY_SPIKE',
          endpoint,
          value: Math.round(avgLatency),
          threshold: Number(zScore.toFixed(2)),
        });
      }

      if (errorRate > 20) {
        anomalies.push({
          type: 'ERROR_SPIKE',
          endpoint,
          value: Number(errorRate.toFixed(2)),
          threshold: 20,
        });
      }

      if (data.requests > avgRequests * 2) {
        anomalies.push({
          type: 'TRAFFIC_SPIKE',
          endpoint,
          value: data.requests,
          threshold: Math.round(avgRequests * 2),
        });
      }
    }

    /*
     * Return anomalies (detection is now handled by AnomalyDetectionService cron)
     */

    await this.redisService.set(cacheKey, JSON.stringify(anomalies), 60);

    return anomalies;
  }

  async getServiceHealth(projectId: string, hours = 72) {
    const cacheKey = `metrics-service-health:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const startDate = this.getStartDate(hours);

    const [stats, errorStats] = await Promise.all([
      this.prisma.apiMetric.aggregate({
        where: {
          projectId,
          createdAt: {
            gte: startDate,
          },
        },
        _avg: {
          latency: true,
        },
        _sum: {
          requests: true,
        },
        _count: {
          id: true,
        },
      }),

      this.prisma.apiMetric.aggregate({
        where: {
          projectId,
          createdAt: {
            gte: startDate,
          },
          statusCode: {
            gte: 400,
          },
        },
        _sum: {
          requests: true,
        },
      }),
    ]);

    const total = stats._count.id;

    if (!total) {
      return {
        healthScore: 100,
        status: 'HEALTHY',
        latencyScore: 100,
        errorScore: 100,
        trafficScore: 100,
        periodHours: hours,
      };
    }

    const avgLatency = stats._avg.latency ?? 0;
    const totalRequests = stats._sum.requests ?? 0;
    const failedRequests = errorStats._sum.requests ?? 0;
    const errorRate = totalRequests === 0 ? 0 : (failedRequests / totalRequests) * 100;

    // Latency score: 100 at 0ms, 0 at 2000ms+ (non-linear curve)
    const latencyScore = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-avgLatency / 500))));

    // Error score: 100 at 0% errors, 0 at 50%+ errors (weighted heavily)
    const errorScore = Math.max(0, Math.round(100 - (errorRate * 2)));

    // Traffic score: based on requests per hour
    const requestsPerHour = totalRequests / hours;
    const trafficScore = requestsPerHour > 10 ? 100 : requestsPerHour > 1 ? 75 : requestsPerHour > 0 ? 50 : 25;

    // Weighted health: errors matter most (50%), latency (35%), traffic (15%)
    const healthScore = Math.round(
      (errorScore * 0.5) + (latencyScore * 0.35) + (trafficScore * 0.15),
    );

    let status = 'HEALTHY';

    if (healthScore < 80) {
      status = 'DEGRADED';
    }

    if (healthScore < 60) {
      status = 'CRITICAL';
    }

    const result = {
      healthScore,
      status,
      latencyScore,
      errorScore,
      trafficScore,
      periodHours: hours,
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 60);

    return result;
  }

  async getSla(projectId: string, hours = 72) {
    const cacheKey = `metrics-sla:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const startDate = this.getStartDate(hours);

    const [successStats, failedStats] = await Promise.all([
      this.prisma.apiMetric.aggregate({
        where: {
          projectId,
          createdAt: {
            gte: startDate,
          },
          statusCode: {
            lt: 400,
          },
        },
        _sum: {
          requests: true,
        },
      }),

      this.prisma.apiMetric.aggregate({
        where: {
          projectId,
          createdAt: {
            gte: startDate,
          },
          statusCode: {
            gte: 400,
          },
        },
        _sum: {
          requests: true,
        },
      }),
    ]);

    const successfulRequests = successStats._sum.requests ?? 0;
    const failedRequests = failedStats._sum.requests ?? 0;
    const total = successfulRequests + failedRequests;

    const availability =
      total === 0
        ? 100
        : Number(((successfulRequests / total) * 100).toFixed(2));

    const target = 99.9;

    const breached = availability < target;

    const result = {
      availability,
      target,
      breached,
      successfulRequests,
      failedRequests,
      periodHours: hours,
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 60);

    return result;
  }

  async getCostEstimation(projectId: string, hours = 72) {
    const cacheKey = `metrics-cost-estimation:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const stats = await this.prisma.apiMetric.aggregate({
      where: {
        projectId,
        createdAt: {
          gte: this.getStartDate(hours),
        },
      },
      _sum: {
        requests: true,
      },
      _count: {
        id: true,
      },
    });

    if (!stats._count.id) {
      return {
        estimatedMonthlyRequests: 0,
        estimatedInfraCost: 0,
        estimatedCacheSavings: 0,
        projectedCost: 0,
        periodHours: hours,
      };
    }

    const totalRequests = stats._sum.requests ?? 0;

    const estimatedMonthlyRequests = Math.round(
      (totalRequests / hours) * 24 * 30,
    );

    const estimatedInfraCost = Number(
      (estimatedMonthlyRequests * 0.00005).toFixed(2),
    );

    const estimatedCacheSavings = Number(
      (estimatedInfraCost * 0.25).toFixed(2),
    );

    const projectedCost = Number(
      (estimatedInfraCost - estimatedCacheSavings).toFixed(2),
    );

    const result = {
      estimatedMonthlyRequests,
      estimatedInfraCost,
      estimatedCacheSavings,
      projectedCost,
      periodHours: hours,
    };

    await this.redisService.set(cacheKey, JSON.stringify(result), 60);

    return result;
  }

  async getTopFailures(projectId: string, hours = 72) {
    const cacheKey = `metrics-top-failures:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await this.prisma.apiMetric.groupBy({
      by: ['endpoint'],

      where: {
        projectId,

        statusCode: {
          gte: 400,
        },

        createdAt: {
          gte: this.getStartDate(hours),
        },
      },

      _count: {
        endpoint: true,
      },

      orderBy: {
        _count: {
          endpoint: 'desc',
        },
      },

      take: 10,
    });

    const response = result.map((item) => ({
      endpoint: item.endpoint,

      errors: item._count.endpoint,
    }));

    await this.redisService.set(cacheKey, JSON.stringify(response), 60);

    return response;
  }

  async getLatencyDistribution(projectId: string, hours = 72) {
    const cacheKey = `metrics-latency-distribution:${projectId}:${hours}`;

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const metrics = await this.prisma.apiMetric.findMany({
      where: {
        projectId,
        createdAt: {
          gte: this.getStartDate(hours),
        },
      },
      select: {
        latency: true,
      },
    });

    const distribution = {
      '0-100': 0,
      '100-250': 0,
      '250-500': 0,
      '500+': 0,
    };

    for (const metric of metrics) {
      const latency = metric.latency;

      if (latency < 100) {
        distribution['0-100']++;
      } else if (latency < 250) {
        distribution['100-250']++;
      } else if (latency < 500) {
        distribution['250-500']++;
      } else {
        distribution['500+']++;
      }
    }

    await this.redisService.set(cacheKey, JSON.stringify(distribution), 60);

    return distribution;
  }

  private getStartDate(hours: number) {
    return new Date(Date.now() - hours * 60 * 60 * 1000);
  }

  private calculateMean(values: number[]) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private calculateStdDev(values: number[], mean: number) {
    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      values.length;

    return Math.sqrt(variance);
  }

  async getComparison(projectId: string, hours = 24) {
    const now = Date.now();
    const currentStart = new Date(now - hours * 60 * 60 * 1000);
    const previousStart = new Date(now - 2 * hours * 60 * 60 * 1000);
    const previousEnd = new Date(now - hours * 60 * 60 * 1000);

    const [currentMetrics, previousMetrics] = await Promise.all([
      this.prisma.apiMetric.findMany({
        where: { projectId, createdAt: { gte: currentStart } },
        select: { latency: true, requests: true, statusCode: true },
      }),
      this.prisma.apiMetric.findMany({
        where: { projectId, createdAt: { gte: previousStart, lt: previousEnd } },
        select: { latency: true, requests: true, statusCode: true },
      }),
    ]);

    const computeStats = (metrics: { latency: number; requests: number; statusCode: number }[]) => {
      if (!metrics.length) return { avgLatency: 0, p95Latency: 0, errorRate: 0, totalRequests: 0, availability: 100 };

      const latencies = metrics.map((m) => m.latency).sort((a, b) => a - b);
      const totalRequests = metrics.reduce((s, m) => s + m.requests, 0);
      const totalErrors = metrics.filter((m) => m.statusCode >= 400).reduce((s, m) => s + m.requests, 0);

      return {
        avgLatency: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
        p95Latency: latencies[Math.floor(latencies.length * 0.95)] || 0,
        errorRate: Number(((totalErrors / totalRequests) * 100).toFixed(2)),
        totalRequests,
        availability: Number(((1 - totalErrors / totalRequests) * 100).toFixed(3)),
      };
    };

    const current = computeStats(currentMetrics);
    const previous = computeStats(previousMetrics);

    const delta = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    return {
      current,
      previous,
      changes: {
        avgLatency: delta(current.avgLatency, previous.avgLatency),
        p95Latency: delta(current.p95Latency, previous.p95Latency),
        errorRate: delta(current.errorRate, previous.errorRate),
        totalRequests: delta(current.totalRequests, previous.totalRequests),
        availability: delta(current.availability, previous.availability),
      },
      periodHours: hours,
    };
  }

  async getEndpointDetail(projectId: string, endpoint: string, hours = 72) {
    const startDate = this.getStartDate(hours);

    const metrics = await this.prisma.apiMetric.findMany({
      where: {
        projectId,
        endpoint,
        createdAt: { gte: startDate },
      },
      select: {
        latency: true,
        requests: true,
        statusCode: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!metrics.length) {
      return { endpoint, latencyTrend: [], errorBreakdown: [], stats: null };
    }

    // Group by hour for trend data
    const hourlyMap = new Map<string, { latencies: number[]; requests: number; errors: number; count: number }>();

    for (const m of metrics) {
      const hourKey = new Date(m.createdAt).toISOString().slice(0, 13) + ':00:00Z';
      const existing = hourlyMap.get(hourKey);
      if (existing) {
        existing.latencies.push(m.latency);
        existing.requests += m.requests;
        if (m.statusCode >= 400) existing.errors++;
        existing.count++;
      } else {
        hourlyMap.set(hourKey, {
          latencies: [m.latency],
          requests: m.requests,
          errors: m.statusCode >= 400 ? 1 : 0,
          count: 1,
        });
      }
    }

    const latencyTrend = Array.from(hourlyMap.entries()).map(([time, data]) => {
      const sorted = [...data.latencies].sort((a, b) => a - b);
      return {
        time,
        avg: Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length),
        p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
        p99: sorted[Math.floor(sorted.length * 0.99)] || 0,
        requests: data.requests,
        errorRate: Number(((data.errors / data.count) * 100).toFixed(2)),
      };
    });

    // Error breakdown by status code
    const statusMap = new Map<number, number>();
    for (const m of metrics) {
      if (m.statusCode >= 400) {
        statusMap.set(m.statusCode, (statusMap.get(m.statusCode) || 0) + 1);
      }
    }
    const errorBreakdown = Array.from(statusMap.entries())
      .map(([statusCode, count]) => ({ statusCode, count }))
      .sort((a, b) => b.count - a.count);

    // Overall stats
    const allLatencies = metrics.map((m) => m.latency).sort((a, b) => a - b);
    const totalRequests = metrics.reduce((s, m) => s + m.requests, 0);
    const totalErrors = metrics.filter((m) => m.statusCode >= 400).length;

    const stats = {
      avgLatency: Math.round(allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length),
      p95Latency: allLatencies[Math.floor(allLatencies.length * 0.95)] || 0,
      p99Latency: allLatencies[Math.floor(allLatencies.length * 0.99)] || 0,
      peakLatency: allLatencies[allLatencies.length - 1] || 0,
      totalRequests,
      errorRate: Number(((totalErrors / metrics.length) * 100).toFixed(2)),
      dataPoints: metrics.length,
    };

    return { endpoint, latencyTrend, errorBreakdown, stats };
  }
}
