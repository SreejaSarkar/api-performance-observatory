import {
    Project,
} from "@/types/project";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

export async function getProjects(): Promise<Project[]> {
    const response =
        await fetch(
            `${API_URL}/projects`,
        );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch projects",
        );
    }

    return response.json();
}

export async function createProject(
    name: string,
): Promise<Project> {
    const response =
        await fetch(
            `${API_URL}/projects`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    name,
                }),
            },
        );

    if (!response.ok) {
        throw new Error(
            "Failed to create project",
        );
    }

    return response.json();
}