export const WEBHOOK_PROVIDERS = [
  'GENERIC',
  'MICROSOFT_TEAMS',
] as const;

export type WebhookProvider = (typeof WEBHOOK_PROVIDERS)[number];

export const DEFAULT_WEBHOOK_PROVIDER: WebhookProvider = 'GENERIC';
