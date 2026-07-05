"use client";

import {
    useState,
} from "react";

interface Props {
    onCreate: (
        url: string,
    ) => Promise<void>;
}

export default function WebhookForm({
    onCreate,
}: Props) {
    const [
        url,
        setUrl,
    ] = useState("");

    return (
        <div
            className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
            "
        >
            <h2
                className="
                    text-xl
                    font-semibold
                    mb-4
                "
            >
                Add Webhook
            </h2>

            <div
                className="
                    flex
                    gap-3
                "
            >
                <input
                    value={url}
                    onChange={(e) =>
                        setUrl(
                            e.target.value,
                        )
                    }
                    placeholder="
                        https://hooks.slack.com/...
                    "
                    className="
                        flex-1
                        bg-slate-800
                        border
                        border-slate-700
                        rounded-xl
                        px-4
                        py-2
                    "
                />

                <button
                    onClick={async () => {
                        if (!url)
                            return;

                        await onCreate(
                            url,
                        );

                        setUrl(
                            "",
                        );
                    }}
                    className="
                        bg-blue-600
                        hover:bg-blue-500
                        px-4
                        py-2
                        rounded-xl
                    "
                >
                    Add
                </button>
            </div>
        </div>
    );
}