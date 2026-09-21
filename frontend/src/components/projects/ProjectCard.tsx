"use client";

import { Project }
    from "@/types/project";
import { useRouter }
    from "next/navigation";
import toast from "react-hot-toast";
import { buttonStyles } from "../ui/ButtonStyles";
import { setSelectedProject }
    from "@/lib/selected-project";

interface Props {
    project: Project;
}

export default function ProjectCard({
    project,
}: Props) {
    const router = useRouter();

    const copyApiKey =
        async () => {
            await navigator.clipboard.writeText(
                project.apiKey,
            );

            toast.success(
                "API key copied to clipboard.",
            );
        };

    return (
        <div
            className="
                bg-slate-900
                border
                border-slate-800
                rounded-xl
                shadow-lg
                p-6
                flex
                flex-col
                gap-2
                w-full
                max-w-sm
                "
        >
            <h3
                className="
                    text-lg
                    font-semibold
                "
            >
                {project.name}
            </h3>

            <p
                className="
                    text-sm
                    text-gray-500
                    mt-2
                "
            >
                API Key
            </p>

            <code
                className="
                    text-xs
                    break-all
                "
            >
                {project.apiKey}
            </code>

            <button
                onClick={
                    copyApiKey
                }
                className={
                    buttonStyles.dark
                }
            >
                Copy
            </button>
            <button
                onClick={() => {
                    setSelectedProject({
                        id: project.id,
                        apiKey: project.apiKey,
                        name: project.name,
                    });

                    router.push(
                        "/dashboard",
                    );
                }}
                className={
                    buttonStyles.success
                }
            >
                Select Project
            </button>
        </div>
    );
}