interface Props {
    availability: number;

    latency: number;

    errorRate: number;

    healthScore: number;

    requests: number;
}

export default function HealthOverviewCard({
    availability,
    latency,
    errorRate,
    healthScore,
    requests,
}: Props) {
    const latencyStatus =
        latency > 500
            ? "🔴"
            : "🟢";

    const errorStatus =
        errorRate > 5
            ? "🟡"
            : "🟢";

    const trafficStatus =
        requests > 0
            ? "🟢"
            : "🔴";

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
                    mb-6
                "
            >
                Health Overview
            </h2>

            <div
                className="
                    space-y-4
                "
            >
                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <span>
                        🟢 Availability
                    </span>

                    <span>
                        {availability}%
                    </span>
                </div>

                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <span>
                        {
                            trafficStatus
                        }{" "}
                        Traffic
                    </span>

                    <span>
                        {requests}
                    </span>
                </div>

                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <span>
                        {
                            errorStatus
                        }{" "}
                        Error Rate
                    </span>

                    <span>
                        {errorRate}%
                    </span>
                </div>

                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <span>
                        {
                            latencyStatus
                        }{" "}
                        Latency
                    </span>

                    <span>
                        {latency} ms
                    </span>
                </div>
            </div>

            <div
                className="
                    mt-6
                    pt-6
                    border-t
                    border-slate-800
                "
            >
                <p
                    className="
                        text-slate-400
                        text-sm
                    "
                >
                    Overall Health Score
                </p>

                <p
                    className="
                        text-4xl
                        font-bold
                        mt-2
                    "
                >
                    {healthScore}
                </p>
            </div>
        </div>
    );
}