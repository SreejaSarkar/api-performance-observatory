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

export async function getTrend(
    hours = 72,
) {
    const response =
        await fetch(
            `${API_URL}/metrics/trend?hours=${hours}`,
            {
                headers:
                    getHeaders(),
            },
        );

    return response.json();
}

export async function getTraffic(
    hours = 72,
) {
    const response =
        await fetch(
            `${API_URL}/metrics/traffic?hours=${hours}`,
            {
                headers:
                    getHeaders(),
            },
        );

    return response.json();
}

export async function getLatencyDistribution(
    hours = 72,
) {
    const response =
        await fetch(
            `${API_URL}/metrics/latency-distribution?hours=${hours}`,
            {
                headers:
                    getHeaders(),
            },
        );

    return response.json();
}

export async function getSlowEndpoints() {
  const response =
    await fetch(
      `${API_URL}/metrics/slow-endpoints`,
      {
        headers: getHeaders(),
      },
    );

  return response.json();
}

export async function getComparison(hours = 24) {
  const response = await fetch(
    `${API_URL}/metrics/comparison?hours=${hours}`,
    { headers: getHeaders() },
  );
  return response.json();
}

export async function getEndpointDetail(endpoint: string, hours = 72) {
  const response = await fetch(
    `${API_URL}/metrics/endpoint-detail/${encodeURIComponent(endpoint)}?hours=${hours}`,
    { headers: getHeaders() },
  );
  return response.json();
}