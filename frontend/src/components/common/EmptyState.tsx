interface Props {
    icon: string;

    title: string;

    description: string;
}

export default function EmptyState({
    icon,
    title,
    description,
}: Props) {
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
                {icon}
            </div>

            <h2
                className="
                    text-2xl
                    font-bold
                "
            >
                {title}
            </h2>

            <p
                className="
                    text-slate-400
                    mt-2
                    max-w-md
                    mx-auto
                "
            >
                {description}
            </p>
        </div>
    );
}