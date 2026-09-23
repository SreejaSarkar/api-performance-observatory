import {
    Send,
    Trash2,
} from 'lucide-react';

import {
    Webhook,
} from '@/types/webhook';
import EmptyState from '../common/EmptyState';

interface Props {
    webhooks: Webhook[];

    onDelete: (
        id: string,
    ) => void;

    onTest: (
        id: string,
    ) => void;
}

function getProviderLabel(provider: Webhook['provider']) {
    if (provider === 'MICROSOFT_TEAMS') {
        return 'Microsoft Teams';
    }

    return 'Generic webhook';
}

export default function WebhookTable({
    webhooks,
    onDelete,
    onTest,
}: Props) {
    if (!webhooks.length) {
    return (
            <EmptyState
                icon="🔗"
                title="No destinations configured"
                description="Add a Microsoft Teams or generic webhook destination so alert rules can notify your team automatically."
            />
    );
    }

    return (
        <div
            className="
                overflow-hidden
                rounded-[28px]
                border
                border-slate-800
                bg-slate-950/80
            "
        >
            <table
                className="
                    w-full
                "
            >
                <thead
                    className="
                        bg-slate-900/90
                    "
                >
                    <tr>
                        <th
                            className="
                                p-4
                                text-left
                            "
                        >
                            Destination
                        </th>

                        <th
                            className="
                                p-4
                                text-left
                            "
                        >
                            URL
                        </th>

                        <th
                            className="
                                p-4
                                text-left
                            "
                        >
                            Created
                        </th>

                        <th
                            className="
                                p-4
                                text-right
                            "
                        >
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {webhooks.map((webhook) => (
                        <tr
                            key={webhook.id}
                            className="
                                border-t
                                border-slate-900
                            "
                        >
                            <td
                                className="
                                    p-4
                                    align-top
                                "
                            >
                                <div
                                    className="
                                        flex
                                        flex-col
                                        gap-2
                                    "
                                >
                                    <span
                                        className="
                                            font-medium
                                            text-white
                                        "
                                    >
                                        {webhook.name || getProviderLabel(webhook.provider)}
                                    </span>

                                    <span
                                        className="
                                            inline-flex
                                            w-fit
                                            rounded-full
                                            bg-cyan-500/10
                                            px-2.5
                                            py-1
                                            text-[11px]
                                            uppercase
                                            tracking-[0.2em]
                                            text-cyan-200
                                        "
                                    >
                                        {getProviderLabel(webhook.provider)}
                                    </span>
                                </div>
                            </td>

                            <td
                                className="
                                    p-4
                                    align-top
                                    text-sm
                                    text-slate-300
                                "
                            >
                                <span
                                    className="
                                        break-all
                                    "
                                >
                                    {webhook.url}
                                </span>
                            </td>

                            <td
                                className="
                                    p-4
                                    align-top
                                    text-sm
                                    text-slate-400
                                "
                            >
                                {new Date(webhook.createdAt).toLocaleString()}
                            </td>

                            <td
                                className="
                                    p-4
                                    align-top
                                "
                            >
                                <div
                                    className="
                                        flex
                                        justify-end
                                        gap-2
                                    "
                                >
                                    <button
                                        onClick={() => onTest(webhook.id)}
                                        className="
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-cyan-500/30
                                            bg-cyan-500/10
                                            px-3
                                            py-2
                                            text-sm
                                            text-cyan-100
                                            transition
                                            hover:bg-cyan-500/20
                                        "
                                    >
                                        <Send
                                            className="
                                                h-4
                                                w-4
                                            "
                                        />
                                        Test
                                    </button>

                                    <button
                                        onClick={() => onDelete(webhook.id)}
                                        className="
                                            rounded-xl
                                            bg-red-600
                                            px-3
                                            py-2
                                            text-white
                                            transition
                                            hover:bg-red-500
                                        "
                                    >
                                        <Trash2
                                            className="
                                                h-4
                                                w-4
                                            "
                                        />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}