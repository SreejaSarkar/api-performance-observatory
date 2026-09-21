"use client";

import {
    useEffect,
    useState,
} from "react";

const PROJECT_EVENT =
    "observatory-project-change";

export type SelectedProject = {
    id: string;
    apiKey: string;
    name: string;
};

function readSelectedProject(): SelectedProject | null {
    if (typeof window === "undefined") {
        return null;
    }

    const id = localStorage.getItem(
        "projectId",
    );
    const apiKey = localStorage.getItem(
        "apiKey",
    );
    const name = localStorage.getItem(
        "projectName",
    );

    if (!id || !apiKey) {
        return null;
    }

    return {
        id,
        apiKey,
        name: name || "Selected project",
    };
}

function emitProjectChange() {
    window.dispatchEvent(
        new Event(PROJECT_EVENT),
    );
}

export function setSelectedProject(
    project: SelectedProject,
) {
    localStorage.setItem(
        "projectId",
        project.id,
    );
    localStorage.setItem(
        "apiKey",
        project.apiKey,
    );
    localStorage.setItem(
        "projectName",
        project.name,
    );

    emitProjectChange();
}

export function clearSelectedProject() {
    localStorage.removeItem(
        "projectId",
    );
    localStorage.removeItem(
        "apiKey",
    );
    localStorage.removeItem(
        "projectName",
    );

    emitProjectChange();
}

export function useSelectedProject() {
    const [project, setProject] =
        useState<SelectedProject | null>(
            null,
        );

    useEffect(() => {
        const sync = () => {
            setProject(
                readSelectedProject(),
            );
        };

        sync();

        window.addEventListener(
            PROJECT_EVENT,
            sync,
        );
        window.addEventListener(
            "storage",
            sync,
        );

        return () => {
            window.removeEventListener(
                PROJECT_EVENT,
                sync,
            );
            window.removeEventListener(
                "storage",
                sync,
            );
        };
    }, []);

    return project;
}

export function hasSelectedProject() {
    return readSelectedProject() !== null;
}