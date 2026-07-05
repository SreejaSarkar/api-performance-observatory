export default function SkeletonCard() {
    return (
        <div
            className="
                animate-pulse
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
                h-32
            "
        >
            <div
                className="
                    h-4
                    bg-slate-700
                    rounded
                    w-1/2
                    mb-4
                "
            />

            <div
                className="
                    h-8
                    bg-slate-700
                    rounded
                    w-1/3
                "
            />
        </div>
    );
}