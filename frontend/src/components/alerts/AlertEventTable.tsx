import {
  AlertEvent,
} from "@/types/alerts";
import SeverityBadge from "../common/SeverityBadge";
import { buttonStyles } from "../ui/ButtonStyles";
import EmptyState from "../common/EmptyState";

interface Props {
  events: AlertEvent[];

  onAck: (
    id: string,
  ) => void;

  onResolve: (
    id: string,
  ) => void;
}

export default function AlertEventTable({
  events,
  onAck,
  onResolve,
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
                    {event.value}
                  </td>

                  <td className="p-4">
                    {event.threshold}
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