interface Props {
  connected: boolean;
}

export default function LiveIndicator({ connected }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${
          connected ? "bg-green-400 animate-pulse" : "bg-slate-500"
        }`}
      />
      <span className="text-xs text-slate-400">
        {connected ? "Live" : "Offline"}
      </span>
    </div>
  );
}
