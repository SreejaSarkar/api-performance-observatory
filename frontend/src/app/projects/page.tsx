"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    getProjects,
} from "@/lib/project-api";

import ProjectCard
    from "@/components/projects/ProjectCard";

import ProjectForm
    from "@/components/projects/ProjectForm";

import { Project }
    from "@/types/project";
import ProjectsPageSkeleton from "@/components/projects/ProjectPageSkeleton";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";

export default function ProjectsPage() {
    const [
        projects,
        setProjects,
    ] =
        useState<Project[]>(
            [],
        );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const loadProjects =
        async () => {
            try {
                setLoading(true);

                setError("");

                const data =
                    await getProjects();

                setProjects(
                    data,
                );
            } catch (err: any) {
                setError(
                    err?.message ||
                    "Failed to load projects.",
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        loadProjects();
    }, []);

    if (loading) {
        return (
            <ProjectsPageSkeleton />
        );
    }

    if (error) {
        return (
            <div
                className="
                p-8
                max-w-6xl
                mx-auto
            "
            >
                <ErrorState
                    message={error}
                    onRetry={
                        loadProjects
                    }
                />
            </div>
        );
    }

    return (
        <div
            className="
                p-8
                max-w-6xl
                mx-auto
            "
        >
            <h1
                className="
                    text-3xl
                    font-bold
                    mb-6
                "
            >
                Projects
            </h1>

            <ProjectForm
                onCreated={
                    loadProjects
                }
            />

            <div
                className="
                    grid
                    md:grid-cols-2
                    gap-4
                "
            >
                {projects.length === 0 ? (
                    <EmptyState
                        icon="📁"
                        title="No Projects Yet"
                        description="
                        Create your first project
                        to start monitoring APIs.
                        "
                    />
                ) : (
                    <>
                        {projects.map(
                            (
                                project,
                            ) => (
                                <ProjectCard
                                    key={
                                        project.id
                                    }
                                    project={
                                        project
                                    }
                                />
                            ),
                        )}
                    </>
                )}
            </div>
        </div>
    );
}