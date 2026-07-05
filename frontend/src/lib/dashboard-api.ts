import { DashboardData }
    from "@/types/dashboard";

const API_URL =
    "http://localhost:3001";

export async function getDashboard(hours = 72):
    Promise<DashboardData> {

    const apiKey =
        localStorage.getItem(
            "apiKey",
        );

    const response =
        await fetch(
            `${API_URL}/dashboard?hours=${hours}`,
            {
                headers: {
                    "x-api-key":
                        apiKey ?? "",
                },
            },
        );

    if (!response.ok) {
        throw new Error(
            "Failed to load dashboard",
        );
    }

    return response.json();
}