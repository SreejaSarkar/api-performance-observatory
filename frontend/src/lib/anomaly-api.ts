const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

function getHeaders() {
  return {
    "x-api-key":
      localStorage.getItem(
        "apiKey",
      ) ?? "",
  };
}

export async function getAnomalies() {
  const response =
    await fetch(
      `${API_URL}/anomalies/history`,
      {
        headers:
          getHeaders(),
      },
    );

  if (!response.ok) {
    throw new Error(
      "Failed to load anomalies",
    );
  }

  return response.json();
}