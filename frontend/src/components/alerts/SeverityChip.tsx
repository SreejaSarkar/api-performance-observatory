interface Props {
    severity: string;
}

export default function SeverityChip({
    severity,
}: Props) {
    return (
        <span
            className="
                px-2
                py-1
                rounded
                text-xs
                font-bold
                border
            "
        >
            {severity}
        </span>
    );
}