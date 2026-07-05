"use client";

import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function LatencyTrendChart({
    data,
}: {
    data: any[];
}) {
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
                Latency Trend
            </h2>

            <ResponsiveContainer
                width="100%"
                height={350}
            >
                <LineChart
                    data={data}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis
                        dataKey="time"
                    />

                    <YAxis />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="latency"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}