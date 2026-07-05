interface Props {
    value: number;

    onChange: (
        hours: number,
    ) => void;
}

export default function TimeRangeSelector({
    value,
    onChange,
}: Props) {
    const ranges = [
        {
            label: "24h",
            value: 24,
        },
        {
            label: "72h",
            value: 72,
        },
        {
            label: "7d",
            value: 168,
        },
    ];

    return (
        <div
            className="
                flex
                gap-2
            "
        >
            {ranges.map(
                (range) => (
                    <button
                        key={
                            range.value
                        }
                        onClick={() =>
                            onChange(
                                range.value,
                            )
                        }
                        className={`
                            px-4
                            py-2
                            rounded-xl
                            transition

                            ${
                                value ===
                                range.value
                                    ? `
                                        bg-blue-600
                                        text-white
                                      `
                                    : `
                                        bg-slate-800
                                        text-slate-300
                                        hover:bg-slate-700
                                      `
                            }
                        `}
                    >
                        {
                            range.label
                        }
                    </button>
                ),
            )}
        </div>
    );
}