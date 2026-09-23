"use client";

import { AlertEvent } from "@/types/alerts";
import { formatAlertMetricValue } from "@/lib/alerts-format";

interface Props {
  event: AlertEvent | null;
  onClose: () => void;
}

export default function AlertEndpointsDialog({
  event,
  onClose,
}: Props) {
  if (!event) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Breached endpoints</h2>
            <p className="mt-2 text-sm text-slate-300">
              Endpoints whose current average is beyond the configured threshold for {event.rule}.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/40">
          {!event.breachEndpoints.length ? (
            <div className="p-6 text-sm text-slate-400">
              No individual endpoints currently exceed this threshold in the active 72-hour window.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/70 text-left text-xs uppercase text-slate-300">
                  <tr>
                    <th className="p-4">Endpoint</th>
                    <th className="p-4">Current average</th>
                  </tr>
                </thead>
                <tbody>
                  {event.breachEndpoints.map((endpoint) => (
                    <tr
                      key={`${event.id}-${endpoint.endpoint}`}
                      className="border-t border-slate-800 text-slate-100"
                    >
                      <td className="p-4 break-all">{endpoint.endpoint}</td>
                      <td className="p-4 text-sky-300">
                        {formatAlertMetricValue(endpoint.value, endpoint.unit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}