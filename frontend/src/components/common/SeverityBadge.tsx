interface Props {
    severity: string;
}

export default function SeverityBadge({
    severity,
}: Props) {
    const styles = {
        LOW:
            "bg-slate-700 text-slate-200",

        MEDIUM:
            "bg-yellow-500/20 text-yellow-400",

        HIGH:
            "bg-orange-500/20 text-orange-400",

        CRITICAL:
            "bg-red-500/20 text-red-400",
    };

    return (
        <span
            className={`
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                ${styles[
                    severity as keyof typeof styles
                ] || styles.LOW}
            `}
        >
            {severity}
        </span>
    );
}