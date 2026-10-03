import { AlertsController } from './alerts.controller';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { AlertsService } from './alerts.service';

describe('AlertsController', () => {
  let controller: AlertsController;
  let alertsService: jest.Mocked<AlertsService>;

  const request = {
    project: {
      id: 'project-1',
    },
  } as unknown as Parameters<AlertsController['getRules']>[0];

  beforeEach(() => {
    alertsService = {
      createRule: jest.fn(),
      getRules: jest.fn(),
      deleteRule: jest.fn(),
      updateRule: jest.fn(),
      createWebhook: jest.fn(),
      getWebhooks: jest.fn(),
      deleteWebhook: jest.fn(),
      getEvents: jest.fn(),
      getStats: jest.fn(),
      acknowledgeEvent: jest.fn(),
      resolveEvent: jest.fn(),
    } as unknown as jest.Mocked<AlertsService>;

    controller = new AlertsController(alertsService);
  });

  it('creates a rule for the request project', async () => {
    const dto: CreateAlertRuleDto = {
      name: 'Latency spike',
      metric: 'LATENCY',
      threshold: 300,
      severity: 'HIGH',
    };

    await controller.createRule(request, dto);

    expect(alertsService.createRule.mock.calls).toEqual([['project-1', dto]]);
  });

  it('returns rules for the request project', async () => {
    await controller.getRules(request);

    expect(alertsService.getRules.mock.calls).toEqual([['project-1']]);
  });

  it('deletes a rule for the request project', async () => {
    await controller.deleteRule(request, 'rule-1');

    expect(alertsService.deleteRule.mock.calls).toEqual([
      ['project-1', 'rule-1'],
    ]);
  });

  it('updates a rule for the request project', async () => {
    const dto: CreateAlertRuleDto = {
      name: 'Error rate spike',
      metric: 'ERROR_RATE',
      threshold: 5,
      severity: 'CRITICAL',
    };

    await controller.updateRule(request, 'rule-1', dto);

    expect(alertsService.updateRule.mock.calls).toEqual([
      ['project-1', 'rule-1', dto],
    ]);
  });

  it('creates a webhook for the request project', async () => {
    const dto: CreateWebhookDto = {
      url: 'https://example.com/webhook',
      name: 'Ops',
      provider: 'SLACK',
    };

    await controller.createWebhook(request, dto);

    expect(alertsService.createWebhook.mock.calls).toEqual([
      ['project-1', dto],
    ]);
  });

  it('returns webhooks for the request project', async () => {
    await controller.getWebhooks(request);

    expect(alertsService.getWebhooks.mock.calls).toEqual([['project-1']]);
  });

  it('deletes a webhook for the request project', async () => {
    await controller.deleteWebhook(request, 'webhook-1');

    expect(alertsService.deleteWebhook.mock.calls).toEqual([
      ['project-1', 'webhook-1'],
    ]);
  });

  it('returns alert events for the request project', async () => {
    await controller.getEvents(request);

    expect(alertsService.getEvents.mock.calls).toEqual([['project-1']]);
  });

  it('returns alert stats for the request project', async () => {
    await controller.getStats(request);

    expect(alertsService.getStats.mock.calls).toEqual([['project-1']]);
  });

  it('acknowledges an event for the request project', async () => {
    await controller.acknowledgeEvent(request, 'event-1');

    expect(alertsService.acknowledgeEvent.mock.calls).toEqual([
      ['project-1', 'event-1'],
    ]);
  });

  it('resolves an event for the request project', async () => {
    await controller.resolveEvent(request, 'event-1');

    expect(alertsService.resolveEvent.mock.calls).toEqual([
      ['project-1', 'event-1'],
    ]);
  });
});
