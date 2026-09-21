import axios from "axios";

import {
    TrackMetricOptions,
} from "./types";

const DEFAULT_SERVER_URL = "https://api-performance-backend-lksd.onrender.com";
const DEFAULT_TIMEOUT = 5000;

function getEnvironmentVariable(name: string): string | undefined {
    if (typeof process === "undefined") {
        return undefined;
    }

    return process.env?.[name];
}

export async function trackMetric(
    options: TrackMetricOptions,
) {
    try {
        await axios.post(
            `${(options.serverUrl ?? getEnvironmentVariable("OBSERVATORY_SERVER_URL") ?? DEFAULT_SERVER_URL).replace(/\/$/, "")}/ingestion/metric`,
            {
                endpoint: options.endpoint,
                method: options.method,
                latency: options.latency,
                requests: 1,
                statusCode: options.statusCode,
                timestamp: options.timestamp ?? new Date().toISOString(),
                requestId: options.requestId,
                responseSize: options.responseSize,
                userAgent: options.userAgent,
                environment: options.environment ?? getEnvironmentVariable("NODE_ENV"),
                metadata: options.metadata,
            },
            {
                headers: {
                    "x-api-key": options.apiKey,
                },
                timeout: options.timeout ?? DEFAULT_TIMEOUT,
            },
        );
    } catch (error) {
        console.error(
            "[API Observatory SDK]",
            error,
        );
    }
}