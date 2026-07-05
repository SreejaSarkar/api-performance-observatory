import {
    ReactNode,
} from "react";

interface Props {
    title: string;

    value: string | number;

    icon?: ReactNode;

    borderColor?: string;
}

export default function MetricCard({
    title,
    value,
    icon,
    borderColor,
}: Props) {
    return (
        <div
            className={`
                bg-slate-900
                border
                ${borderColor ?? "border-slate-800"}
                rounded-2xl
                p-6
            `}
        >
            <div
                className="
                    flex
                    items-center
                    justify-between
                    mb-4
                "
            >
                <span
                    className="
                        text-slate-400
                    "
                >
                    {title}
                </span>

                {icon}
            </div>

            <div
                className="
                    text-4xl
                    font-bold
                "
            >
                {value}
            </div>
        </div>
    );
}