import axios from 'axios';

import {
  DEFAULT_WEBHOOK_PROVIDER,
  type WebhookProvider,
} from './webhook.constants';

type DeliveryTarget = {
  id: string;
  url: string;
  provider?: string | null;
  name?: string | null;
};

type DeliveryType = 'ALERT_TRIGGERED' | 'ALERT_REMINDER' | 'TEST';

export type WebhookNotificationPayload = {
  projectId: string;
  rule: string;
  value: number;
  threshold: number;
  severity: string;
  timestamp: Date;
  deliveryType: DeliveryType;
};

export async function deliverWebhookNotification(
  webhook: DeliveryTarget,
  payload: WebhookNotificationPayload,
) {
  const provider = normalizeProvider(webhook.provider);

  const body =
    provider === 'MICROSOFT_TEAMS'
      ? buildTeamsPayload(webhook, payload)
      : buildGenericPayload(webhook, payload, provider);

  await axios.post(webhook.url, body, {
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function buildGenericPayload(
  webhook: DeliveryTarget,
  payload: WebhookNotificationPayload,
  provider: WebhookProvider,
) {
  return {
    eventType: payload.deliveryType,
    projectId: payload.projectId,
    webhookId: webhook.id,
    webhookName: webhook.name ?? inferFallbackName(provider),
    provider,
    rule: payload.rule,
    severity: payload.severity,
    value: payload.value,
    threshold: payload.threshold,
    timestamp: payload.timestamp.toISOString(),
    message: buildHumanSummary(payload),
  };
}

function buildTeamsPayload(
  webhook: DeliveryTarget,
  payload: WebhookNotificationPayload,
) {
  return {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: buildHumanSummary(payload),
    themeColor: getTeamsThemeColor(payload.severity),
    title:
      payload.deliveryType === 'TEST'
        ? 'Test alert from API Performance Observatory'
        : `${payload.severity} alert: ${payload.rule}`,
    sections: [
      {
        activityTitle: webhook.name ?? 'Microsoft Teams webhook',
        text: buildHumanSummary(payload),
        markdown: true,
        facts: [
          {
            name: 'Project',
            value: payload.projectId,
          },
          {
            name: 'Rule',
            value: payload.rule,
          },
          {
            name: 'Severity',
            value: payload.severity,
          },
          {
            name: 'Current value',
            value: formatMetricValue(payload.value),
          },
          {
            name: 'Threshold',
            value: formatMetricValue(payload.threshold),
          },
          {
            name: 'Delivery type',
            value: payload.deliveryType,
          },
          {
            name: 'Sent at',
            value: payload.timestamp.toISOString(),
          },
        ],
      },
    ],
  };
}

function buildHumanSummary(payload: WebhookNotificationPayload) {
  if (payload.deliveryType === 'TEST') {
    return `Test notification for rule "${payload.rule}". Current value ${formatMetricValue(payload.value)} against threshold ${formatMetricValue(payload.threshold)}.`;
  }

  const deliveryLabel =
    payload.deliveryType === 'ALERT_REMINDER' ? 'Reminder' : 'Alert';

  return `${deliveryLabel}: ${payload.rule} is at ${formatMetricValue(payload.value)} against threshold ${formatMetricValue(payload.threshold)}.`;
}

function getTeamsThemeColor(severity: string) {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 'C62828';
    case 'WARNING':
      return 'F9A825';
    case 'INFO':
      return '1565C0';
    default:
      return '455A64';
  }
}

function normalizeProvider(provider?: string | null): WebhookProvider {
  if (provider === 'MICROSOFT_TEAMS') {
    return provider;
  }

  return DEFAULT_WEBHOOK_PROVIDER;
}

function inferFallbackName(provider: WebhookProvider) {
  if (provider === 'MICROSOFT_TEAMS') {
    return 'Microsoft Teams';
  }

  return 'Generic webhook';
}

function formatMetricValue(value: number) {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return value.toFixed(2);
}
