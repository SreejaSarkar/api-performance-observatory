"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    getProjects,
} from "@/lib/project-api";
import {
    getCurrentUser,
    isSessionExpiredError,
    logout,
} from "@/lib/auth-api";

import ProjectCard
    from "@/components/projects/ProjectCard";

import ProjectForm
    from "@/components/projects/ProjectForm";

import { Project }
    from "@/types/project";
import { User }
    from "@/types/user";
import ProjectsPageSkeleton from "@/components/projects/ProjectPageSkeleton";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import { buttonStyles }
    from "@/components/ui/ButtonStyles";
import toast from "react-hot-toast";
import { clearSelectedProject }
    from "@/lib/selected-project";

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

    const [user, setUser] =
        useState<User | null>(null);

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
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        :
                    "Failed to load projects.",
                );
            } finally {
                setLoading(false);
            }
        };

    async function initializePage() {
            try {
                const currentUser =
                    await getCurrentUser();

                setUser(
                    currentUser,
                );

                const data =
                    await getProjects();

                setProjects(
                    data,
                );
                setError("");
            } catch (err) {
                if (isSessionExpiredError(err)) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load projects.",
                );
            } finally {
                setLoading(false);
            }
        }

    useEffect(() => {
        const timeoutId =
            window.setTimeout(() => {
                void initializePage();
            }, 0);

        return () => {
            window.clearTimeout(
                timeoutId,
            );
        };
    }, []);

    async function handleLogout() {
        try {
            await logout();

            clearSelectedProject();

            toast.success(
                "Signed out",
            );

            window.location.assign(
                "/auth/login",
            );
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to sign out",
            );
        }
    }

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
            <div
                className="
                    flex
                    flex-col
                    gap-4
                    mb-6
                    md:flex-row
                    md:items-center
                    md:justify-between
                "
            >
                <div>
                    <h1
                        className="
                            text-3xl
                            font-bold
                        "
                    >
                        Projects
                    </h1>

                    <p className="text-slate-400 mt-2">
                        {user
                            ? `Signed in as ${user.name}`
                            : "Sign in to manage your monitored projects."}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={
                        handleLogout
                    }
                    className={
                        buttonStyles.dark
                    }
                >
                    Sign out
                </button>
            </div>

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