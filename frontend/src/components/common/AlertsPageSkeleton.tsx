import SkeletonCard
    from "@/components/common/SkeletonCard";

export default function AlertsPageSkeleton() {
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

            {/* KPI Cards */}

            <div
                className="
                    grid
                    md:grid-cols-4
                    gap-4
                    mb-8
                "
            >
                {Array.from({
                    length: 4,
                }).map((_, i) => (
                    <SkeletonCard
                        key={i}
                    />
                ))}
            </div>

            {/* Rules Table */}

            <div
                className="
                    bg-slate-900
                    border
                    border-slate-800
                    rounded-2xl
                    p-6
                    mb-8
                    animate-pulse
                "
            >
                <div
                    className="
                        h-6
                        bg-slate-800
                        rounded
                        w-48
                        mb-6
                    "
                />

                <div
                    className="
                        space-y-4
                    "
                >
                    {Array.from({
                        length: 5,
                    }).map((_, i) => (
                        <div
                            key={i}
                            className="
                                h-12
                                bg-slate-800
                                rounded
                            "
                        />
                    ))}
                </div>
            </div>

            {/* Events Table */}

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
                        bg-slate-800
                        rounded
                        w-48
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