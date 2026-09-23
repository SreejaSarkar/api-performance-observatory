export type WebhookProvider =
    | 'GENERIC'
    | 'MICROSOFT_TEAMS';

export interface Webhook {
    id: string;

    name: string | null;

    provider: WebhookProvider;

    url: string;

    createdAt: string;
}