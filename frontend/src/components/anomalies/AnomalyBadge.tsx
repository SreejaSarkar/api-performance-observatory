interface Props {
  type: string;
  severity?: string;
}

const typeColors: Record<string, string> = {
  LATENCY_SPIKE: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  ERROR_SPIKE: "bg-red-500/10 text-red-400 border-red-500/30",
  TRAFFIC_SPIKE: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  TRAFFIC_DROP: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

const severityIndicator: Record<string, string> = {
  CRITICAL: "bg-red-500",
  WARNING: "bg-yellow-500",
};

export default function AnomalyBadge({
  type,
  severity,
}: Props) {
  const colorClass = typeColors[type] || "bg-slate-500/10 text-slate-400 border-slate-500/30";
  const dotClass = severity ? severityIndicator[severity] || "" : "";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2 py-1 rounded text-xs font-semibold border
        ${colorClass}
      `}
    >
      {dotClass && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      )}
      {type.replace(/_/g, " ")}
    </span>
  );
}