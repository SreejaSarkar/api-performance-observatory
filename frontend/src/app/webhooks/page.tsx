"use client";

import {
    useEffect,
    useState,
} from 'react';

import ProjectHeader
    from '@/components/projects/ProjectHeader';

import WebhookForm
    from '@/components/webhooks/WebhookForm';

import WebhookTable
    from '@/components/webhooks/WebhookTable';

import {
    createWebhook,
    deleteWebhook,
    getWebhooks,
    sendTestWebhook,
    type CreateWebhookInput,
} from '@/lib/webhooks-api';
import toast from 'react-hot-toast';
import { useRequireProject } from '@/lib/useRequireProject';
import StickyPageHeader from '@/components/layout/StickyPageHeader';
import {
    type Webhook,
} from '@/types/webhook';

export default function WebhooksPage() {
    const hasProject = useRequireProject();
    const [
        webhooks,
        setWebhooks,
    ] = useState<Webhook[]>([]);

    async function load() {
        const data = await getWebhooks();

        setWebhooks(data);
    }

    useEffect(() => {
        if (!hasProject) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            void load();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [hasProject]);

    if (!hasProject) {
        return null;
    }

    async function handleCreate(input: CreateWebhookInput) {
        try {
            await createWebhook(input);

            toast.success('Destination saved');

            await load();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to add webhook',
            );
    }
    }

    async function handleDelete(id: string) {
        try {
            await deleteWebhook(id);

            toast.success('Destination removed');

            await load();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to delete webhook',
            );
    }
    }

    async function handleTest(id: string) {
        try {
            await sendTestWebhook(id);

            toast.success('Test notification sent');
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to send test notification',
            );
        }
    }

    return (
        <div
            className="
                mx-auto
                max-w-7xl
                p-8
            "
        >
            <StickyPageHeader>
                <ProjectHeader
                    status="Healthy"
                    subtitle="Configure alert delivery destinations"
                />
            </StickyPageHeader>

            <div
                className="
                    mb-8
                    grid
                    gap-4
                    lg:grid-cols-[1.4fr_0.9fr]
                "
            >
                <div
                    className="
                        rounded-[28px]
                        border
                        border-slate-800
                        bg-slate-950/70
                        p-6
                    "
                >
                    <p
                        className="
                            mb-2
                            text-xs
                            uppercase
                            tracking-[0.28em]
                            text-emerald-300/70
                        "
                    >
                        Recommended workflow
                    </p>

                    <h2
                        className="
                            mb-3
                            text-2xl
                            font-semibold
                            text-white
                        "
                    >
                        Send alert details straight into Teams
                    </h2>

                    <p
                        className="
                            max-w-3xl
                            text-sm
                            text-slate-300
                        "
                    >
                        Store one or more delivery destinations per project. When an alert rule breaches, the backend looks up this project&rsquo;s webhooks and sends the alert details to each configured destination.
                    </p>
                </div>

                <div
                    className="
                        rounded-[28px]
                        border
                        border-amber-400/15
                        bg-amber-400/5
                        p-6
                    "
                >
                    <p
                        className="
                            mb-2
                            text-xs
                            uppercase
                            tracking-[0.24em]
                            text-amber-200/80
                        "
                    >
                        Delivery behavior
                    </p>

                    <div
                        className="
                            grid
                            gap-3
                            text-sm
                            text-slate-300
                        "
                    >
                        <p>Alert rules run on the backend every 30 seconds.</p>
                        <p>Teams destinations receive a formatted card instead of raw JSON.</p>
                        <p>The test action sends a sample notification without waiting for a real breach.</p>
                    </div>
        </div>
            </div>

            <WebhookForm onCreate={handleCreate} />

            <div
                className="
                    mt-8
                "
            >
                <WebhookTable
                    webhooks={webhooks}
                    onDelete={handleDelete}
                    onTest={handleTest}
                />
            </div>
        </div>
    );
}