import SkeletonCard
    from "@/components/common/SkeletonCard";

export default function ProjectsPageSkeleton() {
    return (
        <div
            className="
                p-8
                max-w-6xl
                mx-auto
            "
        >
            <div
                className="
                    h-10
                    w-48
                    bg-slate-800
                    rounded
                    animate-pulse
                    mb-6
                "
            />

            <div
                className="
                    h-24
                    bg-slate-900
                    rounded-2xl
                    animate-pulse
                    mb-6
                "
            />

            <div
                className="
                    grid
                    md:grid-cols-2
                    gap-4
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
        </div>
    );
}