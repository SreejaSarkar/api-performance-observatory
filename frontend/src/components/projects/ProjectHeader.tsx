interface Props {
    projectName: string;

    status?: string;

    subtitle?: string;
}

export default function ProjectHeader({
    projectName,
    status = "Healthy",
    subtitle = "Monitoring last 72 hours",
}: Props) {
    return (
        <div
            className="
                mb-10
                flex
                items-center
                justify-between
            "
        >
            <div>
                <h1
                    className="
                        text-5xl
                        font-bold
                        tracking-tight
                    "
                >
                    {projectName}
                </h1>

                <p
                    className="
                        text-slate-400
                        mt-2
                    "
                >
                    {subtitle}
                </p>
            </div>

            <span
                className="
                    bg-emerald-500/20
                    text-emerald-400
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-semibold
                "
            >
                ● {status}
            </span>
        </div>
    );
}