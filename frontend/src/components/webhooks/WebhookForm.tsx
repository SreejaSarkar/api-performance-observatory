"use client";

import {
    useState,
} from 'react';

import {
    type CreateWebhookInput,
} from '@/lib/webhooks-api';
import {
    type WebhookProvider,
} from '@/types/webhook';

interface Props {
    onCreate: (
        input: CreateWebhookInput,
    ) => Promise<void>;
}

const providerCards: Array<{
    value: WebhookProvider;
    title: string;
    description: string;
    placeholder: string;
}> = [
    {
        value: 'MICROSOFT_TEAMS',
        title: 'Microsoft Teams',
        description: 'Formats alert notifications as a Teams card with severity, threshold, and current value.',
        placeholder: 'https://outlook.office.com/webhook/... or a Power Automate trigger URL',
    },
    {
        value: 'GENERIC',
        title: 'Generic webhook',
        description: 'Sends structured JSON to any endpoint that can receive alert notifications.',
        placeholder: 'https://example.com/webhooks/alerts',
    },
];

export default function WebhookForm({
    onCreate,
}: Props) {
    const [
        name,
        setName,
    ] = useState('');
    const [
        provider,
        setProvider,
    ] = useState<WebhookProvider>('MICROSOFT_TEAMS');
    const [
        url,
        setUrl,
    ] = useState('');

    const selectedProvider =
        providerCards.find((card) => card.value === provider) ?? providerCards[0];

    return (
        <div
            className="
                rounded-[28px]
                border
                border-cyan-500/20
                bg-slate-950/80
                p-6
                shadow-[0_24px_80px_-40px_rgba(34,211,238,0.55)]
                backdrop-blur
            "
        >
            <div
                className="
                    mb-6
                    flex
                    flex-col
                    gap-2
                "
            >
                <p
                    className="
                        text-xs
                        uppercase
                        tracking-[0.28em]
                        text-cyan-300/70
                    "
                >
                    Delivery destination
                </p>

                <h2
                    className="
                        text-2xl
                        font-semibold
                        text-white
                    "
                >
                    Connect a channel for alert notifications
                </h2>

                <p
                    className="
                        max-w-3xl
                        text-sm
                        text-slate-300
                    "
                >
                    Choose Microsoft Teams if you want the backend to send a Teams-ready alert card. You can still use a generic webhook for custom receivers.
                </p>
            </div>

            <div
                className="
                    mb-6
                    grid
                    gap-3
                    md:grid-cols-2
                "
            >
                {providerCards.map((card) => {
                    const isActive = card.value === provider;

                    return (
                        <button
                            key={card.value}
                            type="button"
                            onClick={() => setProvider(card.value)}
                            className={[
                                'rounded-2xl border px-4 py-4 text-left transition',
                                isActive
                                    ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]'
                                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900',
                            ].join(' ')}
                        >
                            <div
                                className="
                                    mb-2
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <span
                                    className="
                                        font-medium
                                        text-white
                                    "
                                >
                                    {card.title}
                                </span>

                                <span
                                    className={[
                                        'rounded-full px-2 py-1 text-[11px] uppercase tracking-[0.24em]',
                                        isActive
                                            ? 'bg-cyan-400/15 text-cyan-200'
                                            : 'bg-slate-800 text-slate-400',
                                    ].join(' ')}
                                >
                                    {isActive ? 'Selected' : 'Available'}
                                </span>
                            </div>

                            <p
                                className="
                                    text-sm
                                    text-slate-300
                                "
                            >
                                {card.description}
                            </p>
                        </button>
                    );
                })}
            </div>

            <div
                className="
                    grid
                    gap-4
                    lg:grid-cols-[1.2fr_1fr]
                "
            >
                <div
                    className="
                        grid
                        gap-4
                    "
                >
                    <label
                        className="
                            grid
                            gap-2
                        "
                    >
                        <span
                            className="
                                text-sm
                                font-medium
                                text-slate-200
                            "
                        >
                            Destination name
                        </span>

                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Primary on-call channel"
                            className="
                                rounded-2xl
                                border
                                border-slate-800
                                bg-slate-900/80
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition
                                placeholder:text-slate-500
                                focus:border-cyan-400/60
                            "
                        />
                    </label>

                    <label
                        className="
                            grid
                            gap-2
                        "
                    >
                        <span
                            className="
                                text-sm
                                font-medium
                                text-slate-200
                            "
                        >
                            Webhook URL
                        </span>

                        <input
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            placeholder={selectedProvider.placeholder}
                            className="
                                rounded-2xl
                                border
                                border-slate-800
                                bg-slate-900/80
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition
                                placeholder:text-slate-500
                                focus:border-cyan-400/60
                            "
                        />
                    </label>

                    <button
                        type="button"
                        onClick={async () => {
                            if (!url) {
                                return;
                            }

                            await onCreate({
                                name: name.trim() || undefined,
                                provider,
                                url,
                            });

                            setName('');
                            setUrl('');
                            setProvider('MICROSOFT_TEAMS');
                        }}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            rounded-2xl
                            bg-cyan-500
                            px-4
                            py-3
                            font-medium
                            text-slate-950
                            transition
                            hover:bg-cyan-400
                        "
                    >
                        Save destination
                    </button>
        </div>

                <div
                    className="
                        rounded-2xl
                        border
                        border-slate-800
                        bg-slate-900/70
                        p-5
                    "
                >
                    <p
                        className="
                            mb-3
                            text-xs
                            uppercase
                            tracking-[0.24em]
                            text-amber-300/70
                        "
                    >
                        Teams setup
                    </p>

                    <div
                        className="
                            grid
                            gap-3
                            text-sm
                            text-slate-300
                        "
                    >
                        <p>1. Create an Incoming Webhook or Power Automate workflow for the target Teams channel.</p>
                        <p>2. Paste that URL here and keep the provider set to Microsoft Teams.</p>
                        <p>3. Use the test action after saving to confirm the channel receives a formatted alert card.</p>
                    </div>

                    <div
                        className="
                            mt-5
                            rounded-2xl
                            border
                            border-cyan-500/15
                            bg-slate-950/70
                            p-4
                        "
                    >
                        <p
                            className="
                                mb-2
                                text-sm
                                font-medium
                                text-cyan-200
                            "
                        >
                            Alert details included
                        </p>

                        <p
                            className="
                                text-sm
                                text-slate-400
                            "
                        >
                            Severity, rule name, current value, threshold, project id, delivery type, and the send timestamp are included in each Teams notification.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}