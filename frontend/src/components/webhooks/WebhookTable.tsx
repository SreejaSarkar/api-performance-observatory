import {
    Trash2,
} from "lucide-react";

import {
    Webhook,
} from "@/types/webhook";
import EmptyState from "../common/EmptyState";

interface Props {
    webhooks: Webhook[];

    onDelete: (
        id: string,
    ) => void;
}

export default function WebhookTable({
    webhooks,
    onDelete,
}: Props) {
    if (!webhooks.length) {
    return (
        <EmptyState
            icon="🔗"
            title="No Webhooks Configured"
            description="
                Add a webhook URL to send alerts
                to Slack, Teams, Discord, or
                other notification platforms.
            "
        />
    );
}

    return (
        <div
            className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                overflow-hidden
            "
        >
            <table
                className="
                    w-full
                "
            >
                <thead
                    className="
                        bg-slate-800
                    "
                >
                    <tr>
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
                            "
                        >
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {webhooks.map(
                        (
                            webhook,
                        ) => (
                            <tr
                                key={
                                    webhook.id
                                }
                                className="
                                    border-t
                                    border-slate-800
                                "
                            >
                                <td
                                    className="
                                        p-4
                                    "
                                >
                                    {
                                        webhook.url
                                    }
                                </td>

                                <td
                                    className="
                                        p-4
                                    "
                                >
                                    {new Date(
                                        webhook.createdAt,
                                    ).toLocaleDateString()}
                                </td>

                                <td
                                    className="
                                        p-4
                                        text-center
                                    "
                                >
                                    <button
                                        onClick={() =>
                                            onDelete(
                                                webhook.id,
                                            )
                                        }
                                        className="
                                            bg-red-600
                                            hover:bg-red-500
                                            px-3
                                            py-2
                                            rounded-lg
                                        "
                                    >
                                        <Trash2
                                            className="
                                                w-4
                                                h-4
                                            "
                                        />
                                    </button>
                                </td>
                            </tr>
                        ),
                    )}
                </tbody>
            </table>
        </div>
    );
}