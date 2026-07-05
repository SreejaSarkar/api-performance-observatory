const API_URL =
    "http://localhost:3001";

function getHeaders() {
    return {
        "x-api-key":
            localStorage.getItem(
                "apiKey",
            ) ?? "",
    };
}

export async function createRule(
    data: {
        name: string;
        metric: string;
        threshold: number;
        severity: string;
    },
) {
    const response = await fetch(
        `${API_URL}/alerts/rules`,
        {
            method: "POST",

            headers: {
                ...getHeaders(),
                "Content-Type": "application/json",
            },

            body: JSON.stringify(data),
        },
    );

    if (!response.ok) {
        throw new Error("Failed to create alert rule");
    }

    return response.json();
}

export async function deleteRule(
    id: string,
) {
    const response = await fetch(
        `${API_URL}/alerts/rules/${id}`,
        {
            method: "DELETE",

            headers: getHeaders(),
        },
    );

    if (!response.ok) {
        throw new Error(
            "Failed to delete alert rule",
        );
    }

    return response.json();
}

export async function updateRule(
    id: string,
    data: {
        name: string;
        metric: string;
        threshold: number;
        severity: string;
    },
) {
    const response = await fetch(
        `${API_URL}/alerts/rules/${id}`,
        {
            method: "PATCH",

            headers: {
                ...getHeaders(),
                "Content-Type": "application/json",
            },

            body: JSON.stringify(data),
        },
    );

    if (!response.ok) {
        throw new Error(
            "Failed to update alert rule",
        );
    }

    return response.json();
}

export async function getRules() {
    const response =
        await fetch(
            `${API_URL}/alerts/rules`,
            {
                headers:
                    getHeaders(),
            },
        );

    return response.json();
}

export async function getEvents() {
    const response =
        await fetch(
            `${API_URL}/alerts/events`,
            {
                headers:
                    getHeaders(),
            },
        );

    return response.json();
}

export async function getStats() {
    const response =
        await fetch(
            `${API_URL}/alerts/stats`,
            {
                headers:
                    getHeaders(),
            },
        );

    return response.json();
}

export async function acknowledge(
    id: string,
) {
    await fetch(
        `${API_URL}/alerts/events/${id}/ack`,
        {
            method: "POST",

            headers:
                getHeaders(),
        },
    );
}

export async function resolve(
    id: string,
) {
    await fetch(
        `${API_URL}/alerts/events/${id}/resolve`,
        {
            method: "POST",

            headers:
                getHeaders(),
        },
    );
}