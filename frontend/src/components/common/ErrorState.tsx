interface Props {
    title?: string;

    message: string;

    onRetry?: () => void;
}

export default function ErrorState({
    title = "Something went wrong",
    message,
    onRetry,
}: Props) {
    return (
        <div
            className="
                bg-red-900/20
                border
                border-red-500/30
                rounded-2xl
                p-8
                text-center
            "
        >
            <div
                className="
                    text-5xl
                    mb-4
                "
            >
                ⚠️
            </div>

            <h2
                className="
                    text-2xl
                    font-bold
                    mb-2
                "
            >
                {title}
            </h2>

            <p
                className="
                    text-slate-400
                    mb-6
                "
            >
                {message}
            </p>

            {onRetry && (
                <button
                    onClick={onRetry}
                    className="
                        bg-red-600
                        hover:bg-red-500
                        px-4
                        py-2
                        rounded-xl
                        transition
                    "
                >
                    Try Again
                </button>
            )}
        </div>
    );
}