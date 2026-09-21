import {
    Project,
} from "@/types/project";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

async function parseError(
    response: Response,
) {
    const data =
        await response
            .json()
            .catch(() => null);

    return (
        data?.message ||
        "Request failed"
    );
}

export async function getProjects(): Promise<Project[]> {
    const response =
        await fetch(
            `${API_URL}/projects`,
            {
                credentials:
                    "include",
            },
        );

    if (!response.ok) {
        throw new Error(
            await parseError(
                response,
            ),
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

                credentials:
                    "include",

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
            await parseError(
                response,
            ),
        );
    }

    return response.json();
}