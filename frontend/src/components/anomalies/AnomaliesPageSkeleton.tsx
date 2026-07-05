export default function AnomaliesPageSkeleton() {
  return (
    <div
      className="
        max-w-7xl
        mx-auto
        p-8
      "
    >
      {/* Header */}

      <div
        className="
          mb-8
        "
      >
        <div
          className="
            h-10
            w-64
            bg-slate-800
            rounded
            animate-pulse
            mb-3
          "
        />

        <div
          className="
            h-4
            w-96
            bg-slate-800
            rounded
            animate-pulse
          "
        />
      </div>

      {/* Table */}

      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-6
          animate-pulse
        "
      >
        <div
          className="
            h-6
            w-48
            bg-slate-800
            rounded
            mb-6
          "
        />

        <div
          className="
            space-y-4
          "
        >
          {Array.from({
            length: 6,
          }).map((_, i) => (
            <div
              key={i}
              className="
                h-14
                bg-slate-800
                rounded
              "
            />
          ))}
        </div>
      </div>
    </div>
  );
}