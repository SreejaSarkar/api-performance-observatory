import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { MetricsService } from 'src/metrics/metrics.service';
import { Cron } from '@nestjs/schedule';
import { AlertRule } from '@prisma/client';
import {
  deliverWebhookNotification,
  type WebhookNotificationPayload,
} from '../webhooks/webhook-delivery';
import { DEFAULT_WEBHOOK_PROVIDER } from '../webhooks/webhook.constants';

type AlertMetricContext = {
  unit: string;
  breachDirection: 'above' | 'below';
  triggerSource: string | null;
  triggerSourceLabel: string;
  triggerSourceValue: number | null;
};

type AlertBreachEndpoint = {
  endpoint: string;
  value: number;
  unit: string;
};

type MetricsSummary = {
  avgLatency: number;
};

type MetricsErrors = {
  errorRate: number;
};

type ServiceHealth = {
  healthScore: number;
};

type EndpointAnalytics = {
  endpoint: string;
  avgLatency: number;
  requests: number;
  errorRate: number;
};

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
  ) {}

  async createRule(projectId: string, dto: CreateAlertRuleDto) {
    return this.prisma.alertRule.create({
      data: {
        projectId,
        name: dto.name,
        metric: dto.metric,
        threshold: dto.threshold,
        severity: dto.severity,
      },
    });
  }

  async getRules(projectId: string) {
    return this.prisma.alertRule.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteRule(projectId: string, ruleId: string) {
    const rule = await this.prisma.alertRule.findFirst({
      where: {
        id: ruleId,
        projectId,
      },
    });

    if (!rule) {
      throw new NotFoundException('Alert rule not found');
    }

    const deletedEvents = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.alertEvent.deleteMany({
        where: {
          projectId,
          ruleId,
        },
      });

      await tx.alertRule.delete({
        where: {
          id: ruleId,
        },
      });

      return count;
    });

    return {
      success: true,
      deletedEvents,
    };
  }

  async updateRule(projectId: string, ruleId: string, dto: CreateAlertRuleDto) {
    const rule = await this.prisma.alertRule.findFirst({
      where: {
        id: ruleId,
        projectId,
      },
    });

    if (!rule) {
      throw new NotFoundException('Alert rule not found');
    }

    return this.prisma.alertRule.update({
      where: {
        id: ruleId,
      },
      data: {
        name: dto.name,
        metric: dto.metric,
        threshold: dto.threshold,
        severity: dto.severity,
      },
    });
  }

  async createWebhook(projectId: string, dto: CreateWebhookDto) {
    return this.prisma.webhook.create({
      data: {
        projectId,
        name: dto.name?.trim() || null,
        provider: dto.provider ?? DEFAULT_WEBHOOK_PROVIDER,
        url: dto.url,
      },
    });
  }

  async getWebhooks(projectId: string) {
    return this.prisma.webhook.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteWebhook(projectId: string, webhookId: string) {
    const webhook = await this.prisma.webhook.findFirst({
      where: {
        id: webhookId,
        projectId,
      },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }

    await this.prisma.webhook.delete({
      where: {
        id: webhookId,
      },
    });

    return {
      success: true,
    };
  }

  @Cron('*/30 * * * * *')
  async checkAlerts() {
    console.log('Checking alerts...');
    const rules = await this.prisma.alertRule.findMany({
      where: {
        enabled: true,
      },
    });

    for (const rule of rules) {
      try {
        await this.evaluateRule(rule);
      } catch (error) {
        console.error(`Failed to evaluate rule ${rule.id}`, error);
      }
    }
  }

  private async evaluateRule(rule: AlertRule) {
    let currentValue = 0;

    switch (rule.metric) {
      case 'LATENCY': {
        const summary = (await this.metricsService.getSummary(
          rule.projectId,
          72,
        )) as MetricsSummary;

        currentValue = summary.avgLatency;
        break;
      }

      case 'ERROR_RATE': {
        const errors = (await this.metricsService.getErrors(
          rule.projectId,
          72,
        )) as MetricsErrors;

        currentValue = errors.errorRate;
        break;
      }

      case 'HEALTH_SCORE': {
        const health = (await this.metricsService.getServiceHealth(
          rule.projectId,
          72,
        )) as ServiceHealth;

        currentValue = health.healthScore;
        break;
      }

      default:
        return;
    }

    console.log('Rule:', rule.name);
    console.log('Metric:', rule.metric);
    console.log('Current Value:', currentValue);
    console.log('Threshold:', rule.threshold);

    const breached =
      rule.metric === 'HEALTH_SCORE'
        ? currentValue < rule.threshold
        : currentValue > rule.threshold;

    console.log('Breached:', breached);

    const activeEvent = await this.prisma.alertEvent.findFirst({
      where: {
        ruleId: rule.id,
        resolved: false,
      },
    });

    // --------------------------------------------------
    // Alert has recovered
    // --------------------------------------------------
    if (!breached) {
      if (activeEvent) {
        await this.prisma.alertEvent.update({
          where: {
            id: activeEvent.id,
          },
          data: {
            resolved: true,
            resolvedAt: new Date(),
          },
        });

        console.log(`Alert resolved: ${rule.name}`);
      }

      return;
    }

    // --------------------------------------------------
    // First breach
    // --------------------------------------------------
    if (!activeEvent) {
      await this.prisma.alertEvent.create({
        data: {
          projectId: rule.projectId,
          ruleId: rule.id,
          value: currentValue,
          lastNotificationAt: new Date(),
        },
      });

      await this.sendWebhooks(rule.projectId, {
        rule: rule.name,
        severity: rule.severity,
        value: currentValue,
        threshold: rule.threshold,
        deliveryType: 'ALERT_TRIGGERED',
      });

      console.log(`Alert triggered: ${rule.name}`);

      return;
    }

    // --------------------------------------------------
    // Existing active alert
    // --------------------------------------------------

    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;

    const shouldNotifyAgain =
      Date.now() - activeEvent.lastNotificationAt.getTime() >= twoDaysInMs;

    if (!shouldNotifyAgain) {
      return;
    }

    await this.sendWebhooks(rule.projectId, {
      rule: rule.name,
      severity: rule.severity,
      value: currentValue,
      threshold: rule.threshold,
      deliveryType: 'ALERT_REMINDER',
    });

    await this.prisma.alertEvent.update({
      where: {
        id: activeEvent.id,
      },
      data: {
        value: currentValue,
        lastNotificationAt: new Date(),
      },
    });

    console.log(`Reminder notification sent for ${rule.name}`);
  }

  async getEvents(projectId: string) {
    const events = await this.prisma.alertEvent.findMany({
      where: {
        projectId,
      },
      orderBy: {
        triggeredAt: 'desc',
      },
      include: {
        rule: true,
      },
    });

    const contextCache = new Map<string, Promise<AlertMetricContext>>();
    const endpointAnalyticsPromise = this.metricsService.getEndpointAnalytics(
      projectId,
      72,
    ) as Promise<EndpointAnalytics[]>;

    const getContext = (metric: string) => {
      const cacheKey = `${projectId}:${metric}`;

      if (!contextCache.has(cacheKey)) {
        contextCache.set(cacheKey, this.buildMetricContext(projectId, metric));
      }

      return contextCache.get(cacheKey)!;
    };

    return Promise.all(
      events.map(async (event) => {
        const context = await getContext(event.rule.metric);
        const breachEndpoints = await this.getBreachEndpoints(
          event.rule.metric,
          event.rule.threshold,
          context.unit,
          endpointAnalyticsPromise,
        );

        return {
          id: event.id,
          rule: event.rule.name,
          metric: event.rule.metric,
          severity: event.rule.severity,
          value: event.value,
          threshold: event.rule.threshold,
          unit: context.unit,
          breachDirection: context.breachDirection,
          triggerSource: context.triggerSource,
          triggerSourceLabel: context.triggerSourceLabel,
          triggerSourceValue: context.triggerSourceValue,
          breachEndpoints,
          acknowledged: event.acknowledged,
          acknowledgedAt: event.acknowledgedAt,
          resolved: event.resolved,
          resolvedAt: event.resolvedAt,
          triggeredAt: event.triggeredAt,
        };
      }),
    );
  }

  private async getBreachEndpoints(
    metric: string,
    threshold: number,
    unit: string,
    endpointAnalyticsPromise: Promise<EndpointAnalytics[]>,
  ): Promise<AlertBreachEndpoint[]> {
    if (metric !== 'LATENCY' && metric !== 'ERROR_RATE') {
      return [];
    }

    const endpoints = await endpointAnalyticsPromise;

    if (metric === 'LATENCY') {
      return endpoints
        .filter((endpoint) => endpoint.avgLatency > threshold)
        .sort((left, right) => right.avgLatency - left.avgLatency)
        .map((endpoint) => ({
          endpoint: endpoint.endpoint,
          value: endpoint.avgLatency,
          unit,
        }));
    }

    return endpoints
      .filter((endpoint) => endpoint.errorRate > threshold)
      .sort((left, right) => right.errorRate - left.errorRate)
      .map((endpoint) => ({
        endpoint: endpoint.endpoint,
        value: endpoint.errorRate,
        unit,
      }));
  }

  private async buildMetricContext(
    projectId: string,
    metric: string,
  ): Promise<AlertMetricContext> {
    switch (metric) {
      case 'LATENCY': {
        const endpoints = (await this.metricsService.getEndpointAnalytics(
          projectId,
          72,
        )) as EndpointAnalytics[];
        const slowestEndpoint = endpoints[0];

        return {
          unit: 'ms',
          breachDirection: 'above',
          triggerSource: slowestEndpoint?.endpoint ?? null,
          triggerSourceLabel: slowestEndpoint
            ? 'Slowest endpoint in the current window'
            : 'Project-wide average latency',
          triggerSourceValue: slowestEndpoint?.avgLatency ?? null,
        };
      }

      case 'ERROR_RATE': {
        const endpoints = (await this.metricsService.getEndpointAnalytics(
          projectId,
          72,
        )) as EndpointAnalytics[];
        const noisiestEndpoint = [...endpoints].sort(
          (left, right) => right.errorRate - left.errorRate,
        )[0];

        return {
          unit: '%',
          breachDirection: 'above',
          triggerSource: noisiestEndpoint?.endpoint ?? null,
          triggerSourceLabel: noisiestEndpoint
            ? 'Highest error-rate endpoint in the current window'
            : 'Project-wide error rate',
          triggerSourceValue: noisiestEndpoint?.errorRate ?? null,
        };
      }

      case 'HEALTH_SCORE':
        return {
          unit: '/100',
          breachDirection: 'below',
          triggerSource: null,
          triggerSourceLabel: 'Project-wide health score across all endpoints',
          triggerSourceValue: null,
        };

      default:
        return {
          unit: '',
          breachDirection: 'above',
          triggerSource: null,
          triggerSourceLabel: 'Project-wide alert metric',
          triggerSourceValue: null,
        };
    }
  }

  private async sendWebhooks(
    projectId: string,
    payload: {
      rule: string;
      value: number;
      threshold: number;
      severity: string;
      deliveryType: 'ALERT_TRIGGERED' | 'ALERT_REMINDER';
    },
  ) {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        projectId,
      },
    });

    await Promise.allSettled(
      webhooks.map((webhook) => {
        const notification: WebhookNotificationPayload = {
          projectId,
          rule: payload.rule,
          value: payload.value,
          threshold: payload.threshold,
          severity: payload.severity,
          timestamp: new Date(),
          deliveryType: payload.deliveryType,
        };

        return deliverWebhookNotification(webhook, notification);
      }),
    );
  }

  async getStats(projectId: string) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const [
      totalAlerts,
      todayAlerts,
      criticalAlerts,
      acknowledgedAlerts,
      unacknowledgedAlerts,
      resolvedAlerts,
      openAlerts,
    ] = await Promise.all([
      this.prisma.alertEvent.count({
        where: {
          projectId,
        },
      }),

      this.prisma.alertEvent.count({
        where: {
          projectId,
          triggeredAt: {
            gte: today,
          },
        },
      }),

      this.prisma.alertEvent.count({
        where: {
          projectId,
          rule: {
            severity: 'CRITICAL',
          },
        },
      }),

      this.prisma.alertEvent.count({
        where: {
          projectId,
          acknowledged: true,
        },
      }),

      this.prisma.alertEvent.count({
        where: {
          projectId,
          acknowledged: false,
        },
      }),

      this.prisma.alertEvent.count({
        where: {
          projectId,
          resolved: true,
        },
      }),

      this.prisma.alertEvent.count({
        where: {
          projectId,
          resolved: false,
        },
      }),
    ]);

    return {
      totalAlerts,
      todayAlerts,
      criticalAlerts,
      acknowledgedAlerts,
      unacknowledgedAlerts,
      resolvedAlerts,
      openAlerts,
    };
  }
  async acknowledgeEvent(projectId: string, eventId: string) {
    const event = await this.prisma.alertEvent.findFirst({
      where: {
        id: eventId,
        projectId,
      },
    });

    if (!event) {
      throw new NotFoundException('Alert event not found');
    }

    if (event.acknowledged) {
      return {
        acknowledged: true,
        acknowledgedAt: event.acknowledgedAt,
      };
    }

    return this.prisma.alertEvent.update({
      where: {
        id: eventId,
      },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
      },
      select: {
        acknowledged: true,
        acknowledgedAt: true,
      },
    });
  }

  async resolveEvent(projectId: string, eventId: string) {
    const event = await this.prisma.alertEvent.findFirst({
      where: {
        id: eventId,
        projectId,
      },
    });

    if (!event) {
      throw new NotFoundException('Alert event not found');
    }

    if (event.resolved) {
      return {
        resolved: true,
        resolvedAt: event.resolvedAt,
      };
    }

    return this.prisma.alertEvent.update({
      where: {
        id: eventId,
      },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
      select: {
        resolved: true,
        resolvedAt: true,
      },
    });
  }
}
