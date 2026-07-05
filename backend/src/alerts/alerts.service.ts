import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { MetricsService } from 'src/metrics/metrics.service';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { AlertRule } from '@prisma/client';

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

    await this.prisma.alertRule.delete({
      where: {
        id: ruleId,
      },
    });

    return {
      success: true,
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

  async createWebhook(projectId: string, url: string) {
    return this.prisma.webhook.create({
      data: {
        projectId,
        url,
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
        const summary = await this.metricsService.getSummary(
          rule.projectId,
          72,
        );

        currentValue = summary.avgLatency;
        break;
      }

      case 'ERROR_RATE': {
        const errors = await this.metricsService.getErrors(rule.projectId, 72);

        currentValue = errors.errorRate;
        break;
      }

      case 'HEALTH_SCORE': {
        const health = await this.metricsService.getServiceHealth(
          rule.projectId,
          72,
        );

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
      include: {
        rule: true,
      },
    });

    return events.map((event) => ({
      id: event.id,

      rule: event.rule.name,

      metric: event.rule.metric,

      severity: event.rule.severity,

      value: event.value,

      threshold: event.rule.threshold,

      acknowledged: event.acknowledged,

      acknowledgedAt: event.acknowledgedAt,

      resolved: event.resolved,

      resolvedAt: event.resolvedAt,

      triggeredAt: event.triggeredAt,
    }));
  }

  private async sendWebhooks(
    projectId: string,
    payload: {
      rule: string;
      value: number;
      threshold: number;
      severity: string;
    },
  ) {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        projectId,
      },
    });

    await Promise.allSettled(
      webhooks.map((webhook) =>
        axios.post(
          webhook.url,
          {
            projectId,

            rule: payload.rule,

            value: payload.value,

            threshold: payload.threshold,

            timestamp: new Date(),
          },
          {
            timeout: 5000,
          },
        ),
      ),
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
