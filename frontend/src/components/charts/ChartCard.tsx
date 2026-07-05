import { ReactNode } from "react";

interface Props {
    title: string;

    description?: string;

    icon?: ReactNode;

    children: ReactNode;
}

export default function ChartCard({
    title,
    description,
    icon,
    children,
}: Props) {
    return (
        <div
            className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
                shadow-xl
            "
        >
            <div
                className="
                    mb-6
                "
            >
                <div
                    className="
                        flex
                        items-center
                        gap-3
                        mb-2
                    "
                >
                    {icon}

                    <h2
                        className="
                            text-xl
                            font-semibold
                        "
                    >
                        {title}
                    </h2>
                </div>

                {description && (
                    <p
                        className="
                            text-slate-400
                            text-sm
                        "
                    >
                        {description}
                    </p>
                )}
            </div>

            {children}
        </div>
    );
}