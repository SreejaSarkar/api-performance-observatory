import {
  AlertEvent,
} from "@/types/alerts";
import { formatAlertMetricValue, getAlertMetricConfig } from "@/lib/alerts-format";
import SeverityBadge from "../common/SeverityBadge";
import { buttonStyles } from "../ui/ButtonStyles";
import EmptyState from "../common/EmptyState";
import { ListCollapse } from "lucide-react";

interface Props {
  events: AlertEvent[];

  onAck: (
    id: string,
  ) => void;

  onResolve: (
    id: string,
  ) => void;

  onShowEndpoints: (
    event: AlertEvent,
  ) => void;
}

export default function AlertEventTable({
  events,
  onAck,
  onResolve,
  onShowEndpoints,
}: Props) {

  if (!events.length) {
    return (
      <EmptyState
        icon="🎉"
        title="No Active Alerts"
        description="
                Your services are healthy.
                No alert rules have been triggered.
            "
      />
    );
  }

  return (
    <div
      className="
bg-slate-900
border
border-slate-800
rounded-2xl
overflow-hidden
shadow-xl
"
    >
      <div
        className="
          px-6
          py-4
          border-b
        "
      >
        <h2
          className="
            text-lg
            font-semibold
          "
        >
          Alert Events
        </h2>
        <div
          className="
    px-6
    py-2
    text-xs
    text-slate-500
    md:hidden
  "
        >
          ← Swipe horizontally →
        </div>
      </div>

      <div
  className="
    w-full
    overflow-x-auto
    overscroll-x-contain
  "
>
  <table
    className="
      w-full
      text-sm
    "
  >
          <thead
            className="
 bg-slate-800
 text-slate-300
 uppercase
 text-xs
 "
          >
            <tr
              className="
 border-t
 border-slate-800
 hover:bg-slate-800/50
 transition
 "
            >
              <th className="p-4 text-left">
                Rule
              </th>

              <th className="p-4 text-left">
                Value
              </th>

              <th className="p-4 text-left">
                Threshold
              </th>

              <th className="p-4 text-left">
                Endpoints
              </th>

              <th className="p-4 text-left">
                Severity
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {events.map(
              (event) => (
                <tr
                  key={event.id}
                  className="
                  border-t
                  border-slate-800
 hover:bg-slate-800/50
 transition
                "
                >
                  <td className="p-4">
                    {event.rule}
                  </td>

                  <td className="p-4">
                    {formatAlertMetricValue(event.value, event.unit)}
                  </td>

                  <td className="p-4">
                    {formatAlertMetricValue(event.threshold, event.unit)}
                    <div className="mt-1 text-xs text-slate-400">
                      {event.breachDirection === "below" ? "Triggers below threshold" : "Triggers above threshold"}
                    </div>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => onShowEndpoints(event)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800"
                      title="Show breached endpoints"
                    >
                      <ListCollapse size={16} />
                      <span>
                        {event.breachEndpoints.length
                          ? `${event.breachEndpoints.length} endpoints`
                          : "View list"}
                      </span>
                    </button>
                    <div className="mt-2 text-xs text-slate-400">
                      {event.metric === "HEALTH_SCORE"
                        ? "Health score is project-wide, so there is no endpoint list."
                        : `Shows endpoints whose ${getAlertMetricConfig(event.metric).label.toLowerCase()} is above threshold.`}
                    </div>
                  </td>

                  <td>
                    <SeverityBadge
                      severity={
                        event.severity
                      }
                    />
                  </td>

                  <td className="p-4">
                    {event.resolved
                      ? "Resolved"
                      : event.acknowledged
                        ? "Acknowledged"
                        : "Active"}
                  </td>

                  <td className="p-4">
                    <div
                      className="
                      flex
                      gap-2
                    "
                    >
                      {!event.acknowledged &&
                        !event.resolved && (
                          <button
                            onClick={() =>
                              onAck(
                                event.id,
                              )
                            }
                            className={
                              buttonStyles.warning
                            }
                          >
                            ACK
                          </button>
                        )}

                      {!event.resolved && (
                        <button
                          onClick={() =>
                            onResolve(
                              event.id,
                            )
                          }
                          className={buttonStyles.primary}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}