interface Props {
    status:
        | "HEALTHY"
        | "DEGRADED"
        | "CRITICAL"
        | "ACTIVE"
        | "ACKNOWLEDGED"
        | "RESOLVED";
}

export default function StatusBadge({
    status,
}: Props) {
    const colorMap = {
        HEALTHY:
            "bg-emerald-500",

        DEGRADED:
            "bg-yellow-500",

        CRITICAL:
            "bg-red-500",

        ACTIVE:
            "bg-blue-500",

        ACKNOWLEDGED:
            "bg-orange-500",

        RESOLVED:
            "bg-emerald-500",
    };

    return (
        <div
            className="
                flex
                items-center
                gap-2
            "
        >
            <div
                className={`
                    w-2
                    h-2
                    rounded-full
                    ${
                        colorMap[
                            status
                        ]
                    }
                `}
            />

            <span>
                {status}
            </span>
        </div>
    );
}