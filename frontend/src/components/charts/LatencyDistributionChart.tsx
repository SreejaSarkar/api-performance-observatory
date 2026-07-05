"use client";

import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function LatencyDistributionChart({
    distribution,
}: {
    distribution:
        Record<
            string,
            number
        >;
}) {
    const data =
        Object.entries(
            distribution,
        ).map(
            ([range, count]) => ({
                range,
                count,
            }),
        );

    return (
        <div
            className="
                bg-white
                p-6
                rounded-xl
                border
                shadow-sm
            "
        >
            <h2
                className="
                    text-lg
                    font-bold
                    mb-4
                "
            >
                Latency Distribution
            </h2>

            <ResponsiveContainer
                width="100%"
                height={350}
            >
                <BarChart
                    data={data}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="range"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                        dataKey="count"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}