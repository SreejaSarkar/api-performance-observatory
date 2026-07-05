"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparisonData {
  current: {
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
    totalRequests: number;
    availability: number;
  };
  previous: {
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
    totalRequests: number;
    availability: number;
  };
  changes: {
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
    totalRequests: number;
    availability: number;
  };
  periodHours: number;
}

interface Props {
  data: ComparisonData | null;
}

function ChangeIndicator({
  value,
  inverse = false,
}: {
  value: number;
  inverse?: boolean;
}) {
  if (value === 0) {
    return (
      <span className="flex items-center gap-1 text-slate-400 text-xs">
        <Minus className="w-3 h-3" />
        0%
      </span>
    );
  }

  // For latency/errors: going up is bad (red). For requests/availability: going up is good (green).
  const isPositiveChange = inverse ? value < 0 : value > 0;

  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${
        isPositiveChange ? "text-green-400" : "text-red-400"
      }`}
    >
      {value > 0 ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {value > 0 ? "+" : ""}
      {value}%
    </span>
  );
}

export default function ComparisonBar({ data }: Props) {
  if (!data) return null;

  const metrics = [
    { label: "Avg Latency", value: `${data.current.avgLatency}ms`, change: data.changes.avgLatency, inverse: true },
    { label: "P95 Latency", value: `${data.current.p95Latency}ms`, change: data.changes.p95Latency, inverse: true },
    { label: "Error Rate", value: `${data.current.errorRate}%`, change: data.changes.errorRate, inverse: true },
    { label: "Requests", value: data.current.totalRequests.toLocaleString(), change: data.changes.totalRequests, inverse: false },
    { label: "Availability", value: `${data.current.availability}%`, change: data.changes.availability, inverse: false },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-300">
          vs Previous {data.periodHours}h
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">{m.label}</span>
            <span className="text-sm font-semibold">{m.value}</span>
            <ChangeIndicator value={m.change} inverse={m.inverse} />
          </div>
        ))}
      </div>
    </div>
  );
}
