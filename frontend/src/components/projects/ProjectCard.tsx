"use client";

import { Project }
    from "@/types/project";
import { useRouter }
    from "next/navigation";
import { buttonStyles } from "../ui/ButtonStyles";

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

            alert(
                "API Key copied",
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
                    localStorage.setItem(
                        "apiKey",
                        project.apiKey,
                    );
                    localStorage.setItem(
                        "projectId",
                        project.id,
                    );

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