import { NotFoundException } from '@nestjs/common';

import { AlertsService } from './alerts.service';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { DEFAULT_WEBHOOK_PROVIDER } from '../webhooks/webhook.constants';

jest.mock('../webhooks/webhook-delivery', () => ({
  deliverWebhookNotification: jest.fn().mockResolvedValue(undefined),
}));

describe('AlertsService', () => {
  let service: AlertsService;
  let prisma: {
    alertRule: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    alertEvent: {
      deleteMany: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    webhook: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let metricsService: {
    getEndpointAnalytics: jest.Mock;
  };

  beforeEach(() => {
    prisma = {
      alertRule: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      alertEvent: {
        deleteMany: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      webhook: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    metricsService = {
      getEndpointAnalytics: jest.fn(),
    };

    service = new AlertsService(prisma as never, metricsService as never);
  });

  it('creates a rule with the provided alert data', async () => {
    const dto: CreateAlertRuleDto = {
      name: 'Latency spike',
      metric: 'LATENCY',
      threshold: 300,
      severity: 'HIGH',
    };

    await service.createRule('project-1', dto);

    expect(prisma.alertRule.create).toHaveBeenCalledWith({
      data: {
        projectId: 'project-1',
        name: dto.name,
        metric: dto.metric,
        threshold: dto.threshold,
        severity: dto.severity,
      },
    });
  });

  it('returns project rules ordered by creation date descending', async () => {
    await service.getRules('project-1');

    expect(prisma.alertRule.findMany).toHaveBeenCalledWith({
      where: { projectId: 'project-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('deletes a rule and its events inside a transaction', async () => {
    prisma.alertRule.findFirst.mockResolvedValue({ id: 'rule-1' });
    prisma.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          alertEvent: {
            deleteMany: jest.fn().mockResolvedValue({ count: 4 }),
          },
          alertRule: {
            delete: jest.fn().mockResolvedValue(undefined),
          },
        }),
    );

    await expect(service.deleteRule('project-1', 'rule-1')).resolves.toEqual({
      success: true,
      deletedEvents: 4,
    });
  });

  it('throws when deleting an unknown rule', async () => {
    prisma.alertRule.findFirst.mockResolvedValue(null);

    await expect(
      service.deleteRule('project-1', 'missing-rule'),
    ).rejects.toThrow(new NotFoundException('Alert rule not found'));
  });

  it('updates an existing rule', async () => {
    const dto: CreateAlertRuleDto = {
      name: 'Health score drop',
      metric: 'HEALTH_SCORE',
      threshold: 75,
      severity: 'CRITICAL',
    };

    prisma.alertRule.findFirst.mockResolvedValue({ id: 'rule-1' });

    await service.updateRule('project-1', 'rule-1', dto);

    expect(prisma.alertRule.update).toHaveBeenCalledWith({
      where: { id: 'rule-1' },
      data: dto,
    });
  });

  it('throws when updating an unknown rule', async () => {
    const dto: CreateAlertRuleDto = {
      name: 'Health score drop',
      metric: 'HEALTH_SCORE',
      threshold: 75,
      severity: 'CRITICAL',
    };

    prisma.alertRule.findFirst.mockResolvedValue(null);

    await expect(
      service.updateRule('project-1', 'missing-rule', dto),
    ).rejects.toThrow(new NotFoundException('Alert rule not found'));
  });

  it('creates a webhook with trimmed name and default provider', async () => {
    const dto: CreateWebhookDto = {
      url: 'https://example.com',
      name: '  Ops Pager  ',
    };

    await service.createWebhook('project-1', dto);

    expect(prisma.webhook.create).toHaveBeenCalledWith({
      data: {
        projectId: 'project-1',
        name: 'Ops Pager',
        provider: DEFAULT_WEBHOOK_PROVIDER,
        url: 'https://example.com',
      },
    });
  });

  it('returns project webhooks ordered by creation date descending', async () => {
    await service.getWebhooks('project-1');

    expect(prisma.webhook.findMany).toHaveBeenCalledWith({
      where: { projectId: 'project-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('deletes an existing webhook', async () => {
    prisma.webhook.findFirst.mockResolvedValue({ id: 'webhook-1' });

    await expect(
      service.deleteWebhook('project-1', 'webhook-1'),
    ).resolves.toEqual({
      success: true,
    });
    expect(prisma.webhook.delete).toHaveBeenCalledWith({
      where: { id: 'webhook-1' },
    });
  });

  it('throws when deleting an unknown webhook', async () => {
    prisma.webhook.findFirst.mockResolvedValue(null);

    await expect(
      service.deleteWebhook('project-1', 'missing-webhook'),
    ).rejects.toThrow(new NotFoundException('Webhook not found'));
  });

  it('builds enriched alert events from alert data and endpoint analytics', async () => {
    const triggeredAt = new Date('2026-09-29T12:00:00.000Z');

    prisma.alertEvent.findMany.mockResolvedValue([
      {
        id: 'event-1',
        value: 420,
        acknowledged: false,
        acknowledgedAt: null,
        resolved: false,
        resolvedAt: null,
        triggeredAt,
        rule: {
          name: 'Latency spike',
          metric: 'LATENCY',
          severity: 'CRITICAL',
          threshold: 300,
        },
      },
    ]);
    metricsService.getEndpointAnalytics.mockResolvedValue([
      {
        endpoint: '/checkout',
        avgLatency: 420,
        requests: 80,
        errorRate: 2,
      },
      {
        endpoint: '/login',
        avgLatency: 250,
        requests: 120,
        errorRate: 1,
      },
    ]);

    await expect(service.getEvents('project-1')).resolves.toEqual([
      {
        id: 'event-1',
        rule: 'Latency spike',
        metric: 'LATENCY',
        severity: 'CRITICAL',
        value: 420,
        threshold: 300,
        unit: 'ms',
        breachDirection: 'above',
        triggerSource: '/checkout',
        triggerSourceLabel: 'Slowest endpoint in the current window',
        triggerSourceValue: 420,
        breachEndpoints: [
          {
            endpoint: '/checkout',
            value: 420,
            unit: 'ms',
          },
        ],
        acknowledged: false,
        acknowledgedAt: null,
        resolved: false,
        resolvedAt: null,
        triggeredAt,
      },
    ]);
    expect(metricsService.getEndpointAnalytics).toHaveBeenCalledWith(
      'project-1',
      72,
    );
  });

  it('returns aggregated alert stats from event counts', async () => {
    prisma.alertEvent.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(9);

    await expect(service.getStats('project-1')).resolves.toEqual({
      totalAlerts: 10,
      todayAlerts: 3,
      criticalAlerts: 2,
      acknowledgedAlerts: 4,
      unacknowledgedAlerts: 6,
      resolvedAlerts: 1,
      openAlerts: 9,
    });
    expect(prisma.alertEvent.count).toHaveBeenCalledTimes(7);
  });

  it('acknowledges an existing event', async () => {
    const acknowledgedAt = new Date('2026-09-29T13:00:00.000Z');

    prisma.alertEvent.findFirst.mockResolvedValue({
      id: 'event-1',
      acknowledged: false,
      acknowledgedAt: null,
    });
    prisma.alertEvent.update.mockResolvedValue({
      acknowledged: true,
      acknowledgedAt,
    });

    await expect(
      service.acknowledgeEvent('project-1', 'event-1'),
    ).resolves.toEqual({
      acknowledged: true,
      acknowledgedAt,
    });
  });

  it('returns the existing acknowledgement when event was already acknowledged', async () => {
    const acknowledgedAt = new Date('2026-09-29T13:00:00.000Z');

    prisma.alertEvent.findFirst.mockResolvedValue({
      id: 'event-1',
      acknowledged: true,
      acknowledgedAt,
    });

    await expect(
      service.acknowledgeEvent('project-1', 'event-1'),
    ).resolves.toEqual({
      acknowledged: true,
      acknowledgedAt,
    });
    expect(prisma.alertEvent.update).not.toHaveBeenCalled();
  });

  it('throws when acknowledging an unknown event', async () => {
    prisma.alertEvent.findFirst.mockResolvedValue(null);

    await expect(
      service.acknowledgeEvent('project-1', 'missing-event'),
    ).rejects.toThrow(new NotFoundException('Alert event not found'));
  });

  it('resolves an existing event', async () => {
    const resolvedAt = new Date('2026-09-29T14:00:00.000Z');

    prisma.alertEvent.findFirst.mockResolvedValue({
      id: 'event-1',
      resolved: false,
      resolvedAt: null,
    });
    prisma.alertEvent.update.mockResolvedValue({
      resolved: true,
      resolvedAt,
    });

    await expect(service.resolveEvent('project-1', 'event-1')).resolves.toEqual(
      {
        resolved: true,
        resolvedAt,
      },
    );
  });

  it('returns the existing resolution when event was already resolved', async () => {
    const resolvedAt = new Date('2026-09-29T14:00:00.000Z');

    prisma.alertEvent.findFirst.mockResolvedValue({
      id: 'event-1',
      resolved: true,
      resolvedAt,
    });

    await expect(service.resolveEvent('project-1', 'event-1')).resolves.toEqual(
      {
        resolved: true,
        resolvedAt,
      },
    );
    expect(prisma.alertEvent.update).not.toHaveBeenCalled();
  });

  it('throws when resolving an unknown event', async () => {
    prisma.alertEvent.findFirst.mockResolvedValue(null);

    await expect(
      service.resolveEvent('project-1', 'missing-event'),
    ).rejects.toThrow(new NotFoundException('Alert event not found'));
  });
});
