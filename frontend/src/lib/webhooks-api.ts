const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

function getApiKey() {
    return (
        localStorage.getItem(
            "apiKey",
        ) || ""
    );
}

export async function getWebhooks() {
    const response =
        await fetch(
            `${API_URL}/webhooks`,
            {
                headers: {
                    "x-api-key":
                        getApiKey(),
                },
            },
        );

    return response.json();
}

export async function createWebhook(
    url: string,
) {
    const response =
        await fetch(
            `${API_URL}/webhooks`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "x-api-key":
                        getApiKey(),
                },

                body: JSON.stringify({
                    url,
                }),
            },
        );

    return response.json();
}

export async function deleteWebhook(
    id: string,
) {
    await fetch(
        `${API_URL}/webhooks/${id}`,
        {
            method: "DELETE",

            headers: {
                "x-api-key":
                    getApiKey(),
            },
        },
    );
}