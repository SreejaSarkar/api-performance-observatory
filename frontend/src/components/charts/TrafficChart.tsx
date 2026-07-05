"use client";

import {
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function TrafficChart({
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
                Traffic
            </h2>

            <ResponsiveContainer
                width="100%"
                height={350}
            >
                <AreaChart
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

                    <Area
                        dataKey="requests"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}