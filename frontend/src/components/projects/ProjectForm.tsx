"use client";

import {
    useState,
} from "react";

import {
    createProject,
} from "@/lib/project-api";
import { buttonStyles } from "../ui/ButtonStyles";
import toast from "react-hot-toast";

interface Props {
    onCreated: () => void;
}

export default function ProjectForm({
    onCreated,
}: Props) {
    const [name, setName] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleSubmit =
        async (
            e: React.FormEvent,
        ) => {
            e.preventDefault();

            setLoading(
                true,
            );

            try {
                await createProject(
                    name,
                );

                toast.success(
                    "Project created",
                );

                setName("");

                onCreated();
            }
            catch {
                toast.error(
                    "Failed to create project",
                );
            }
            finally {
                setLoading(
                    false,
                );
            }
        };

    return (
        <form
            onSubmit={
                handleSubmit
            }
            className="
                flex
                gap-2
                mb-6
            "
        >
            <input
                value={name}
                onChange={(e) =>
                    setName(
                        e.target.value,
                    )
                }
                placeholder="Project name"
                className="
                    border
                    p-2
                    rounded
                    flex-1
                "
            />

            <button
                disabled={
                    loading
                }
                className={
                    buttonStyles.primary
                }
            >
                Create
            </button>
        </form>
    );
}