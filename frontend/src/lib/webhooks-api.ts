const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3001';

import {
    WebhookProvider,
} from '@/types/webhook';

function getApiKey() {
    return localStorage.getItem('apiKey') || '';
}

export type CreateWebhookInput = {
    name?: string;
    provider: WebhookProvider;
    url: string;
};

async function parseResponse(response: Response) {
    if (!response.ok) {
        let message = 'Request failed';

        try {
            const data = await response.json();

            if (typeof data?.message === 'string') {
                message = data.message;
            }
        } catch {
            message = response.statusText || message;
        }

        throw new Error(message);
    }

    return response.json();
}

export async function getWebhooks() {
    const response = await fetch(
        `${API_URL}/webhooks`,
        {
            headers: {
                'x-api-key': getApiKey(),
            },
        },
    );

    return parseResponse(response);
}

export async function createWebhook(
    input: CreateWebhookInput,
) {
    const response = await fetch(
        `${API_URL}/webhooks`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': getApiKey(),
            },
            body: JSON.stringify(input),
        },
    );

    return parseResponse(response);
}

export async function deleteWebhook(
    id: string,
) {
    const response = await fetch(
        `${API_URL}/webhooks/${id}`,
        {
            method: 'DELETE',
            headers: {
                'x-api-key': getApiKey(),
            },
        },
    );

    await parseResponse(response);
}

export async function sendTestWebhook(
    id: string,
) {
    const response = await fetch(
        `${API_URL}/webhooks/${id}/test`,
        {
            method: 'POST',
            headers: {
                'x-api-key': getApiKey(),
            },
        },
    );

    return parseResponse(response);
}