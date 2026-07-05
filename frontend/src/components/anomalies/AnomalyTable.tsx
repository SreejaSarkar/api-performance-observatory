import { useState } from "react";
import Link from "next/link";
import {
  Anomaly,
} from "@/types/anomaly";

import AnomalyBadge
  from "./AnomalyBadge";
import EmptyState from "../common/EmptyState";

interface Props {
  anomalies: Anomaly[];
}

type Filter = "active" | "resolved" | "all";

export default function AnomalyTable({
  anomalies,
}: Props) {
  const [filter, setFilter] = useState<Filter>("active");

  const filtered = anomalies.filter((a) => {
    if (filter === "active") return !a.resolved;
    if (filter === "resolved") return a.resolved;
    return true;
  });

  if (!anomalies.length) {
    return (
      <EmptyState
        icon="✅"
        title="No Anomalies Detected"
        description="
        Traffic, latency, and error rates
        are within expected thresholds.
    "
      />
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
      <div className="px-4 md:px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold">Anomaly History</h2>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(["active", "resolved", "all"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                filter === f
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 px-4 py-2 md:hidden">← Scroll horizontally to see all columns →</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-300 uppercase text-xs">
            <tr>
              <th className="p-3 md:p-4 text-left">Type</th>
              <th className="p-3 md:p-4 text-left">Severity</th>
              <th className="p-3 md:p-4 text-left">Endpoint</th>
              <th className="p-3 md:p-4 text-left">Value</th>
              <th className="p-3 md:p-4 text-left hidden sm:table-cell">Threshold</th>
              <th className="p-3 md:p-4 text-left">Status</th>
              <th className="p-3 md:p-4 text-left hidden sm:table-cell">Detected At</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((anomaly) => (
              <tr
                key={anomaly.id}
                className="border-t border-slate-800 hover:bg-slate-800/50 transition"
              >
                <td className="p-3 md:p-4">
                  <AnomalyBadge
                    type={anomaly.type}
                    severity={anomaly.severity}
                  />
                </td>

                <td className="p-3 md:p-4">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      anomaly.severity === "CRITICAL"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {anomaly.severity}
                  </span>
                </td>

                <td className="p-3 md:p-4 font-mono text-xs">
                  <Link
                    href={`/endpoints/${encodeURIComponent(anomaly.endpoint)}`}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {anomaly.endpoint}
                  </Link>
                </td>

                <td className="p-3 md:p-4">{anomaly.value}</td>

                <td className="p-3 md:p-4 hidden sm:table-cell">{anomaly.threshold}</td>

                <td className="p-3 md:p-4">
                  {anomaly.resolved ? (
                    <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      Active
                    </span>
                  )}
                </td>

                <td className="p-3 md:p-4 text-slate-400 hidden sm:table-cell">
                  {new Date(anomaly.detectedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No {filter} anomalies found.
          </div>
        )}
      </div>
    </div>
  );
}