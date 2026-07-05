import {
  AlertRule,
} from "@/types/alerts";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  rules: AlertRule[];
  onDelete: (id: string) => void;
  onEdit: (rule: AlertRule) => void;
}

export default function AlertRuleTable({
  rules,
  onDelete,
  onEdit
}: Props) {

  if (!rules.length) {
    return (
      <div
        className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-12
        text-center
      "
      >
        <div
          className="
          text-5xl
          mb-4
        "
        >
          🔔
        </div>

        <h2
          className="
          text-2xl
          font-bold
        "
        >
          No Alert Rules
        </h2>

        <p
          className="
          text-slate-400
          mt-2
        "
        >
          Create your first alert rule.
        </p>
      </div>
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
          Alert Rules
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
    table-auto
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
              <th className="text-left p-4 text-slate-200">
                Name
              </th>

              <th className="text-left p-4 text-slate-200">
                Metric
              </th>

              <th className="text-left p-4 text-slate-200">
                Threshold
              </th>

              <th className="text-left p-4 text-slate-200">
                Severity
              </th>

              <th className="text-left p-4 text-slate-200">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {rules.map(
              (rule) => (
                <tr
                  key={rule.id}
                  className="
                  border-t
                  border-slate-800
                   hover:bg-slate-800/50
 transition
                "
                >
                  <td className="p-4 text-slate-200">
                    {rule.name}
                  </td>

                  <td className="p-4 text-slate-200">
                    {rule.metric}
                  </td>

                  <td className="p-4 text-slate-200">
                    {rule.threshold}
                  </td>

                  <td className="p-4 text-slate-200">
                    {rule.severity}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(rule)}
                        className="
      p-2
      rounded-full
      hover:bg-slate-700
      text-blue-400
      transition
    "
                        title="Edit Rule"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm("Delete this alert rule?")) {
                            onDelete(rule.id);
                          }
                        }}
                        className="
      p-2
      rounded-full
      hover:bg-slate-700
      text-red-400
      transition
    "
                        title="Delete Rule"
                      >
                        <Trash2 size={18} />
                      </button>
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
