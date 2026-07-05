import SeverityBadge
    from "@/components/common/SeverityBadge";
import EmptyState from "../common/EmptyState";

interface AlertEvent {
    id: string;

    rule: string;

    severity: string;

    value: number;

    threshold: number;

    triggeredAt: string;
}

interface Props {
    events: AlertEvent[];
}

export default function RecentAlertsCard({
    events,
}: Props) {
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
                Recent Alerts
            </h2>

            {!events.length ? (
                <EmptyState
                    icon="🎉"
                    title="No Recent Alerts"
                    description="
                    No incidents have been
                    detected recently.
                    "
                />

            ) : (
                <div
                    className="
                        space-y-4
                    "
                >
                    {events.map(
                        (event) => (
                            <div
                                key={
                                    event.id
                                }
                                className="
                                    border-b
                                    border-slate-800
                                    pb-4
                                "
                            >
                                <div
                                    className="
                                        flex
                                        justify-between
                                        items-center
                                        mb-2
                                    "
                                >
                                    <span
                                        className="
                                            font-medium
                                        "
                                    >
                                        {
                                            event.rule
                                        }
                                    </span>

                                    <SeverityBadge
                                        severity={
                                            event.severity
                                        }
                                    />
                                </div>

                                <p
                                    className="
                                        text-slate-400
                                        text-sm
                                    "
                                >
                                    {
                                        event.value
                                    }
                                    {" > "}
                                    {
                                        event.threshold
                                    }
                                </p>

                                <p
                                    className="
                                        text-slate-500
                                        text-xs
                                        mt-1
                                    "
                                >
                                    {new Date(
                                        event.triggeredAt,
                                    ).toLocaleString()}
                                </p>
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}