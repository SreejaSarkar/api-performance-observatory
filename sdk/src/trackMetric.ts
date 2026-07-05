import axios from "axios";

import {
    TrackMetricOptions,
} from "./types";

export async function trackMetric(
    options: TrackMetricOptions,
) {
    try {
        await axios.post(
            `${options.serverUrl}/ingestion/metric`,
            {
                endpoint: options.endpoint,
                latency: options.latency,
                requests: 1,
                statusCode: options.statusCode,
            },
            {
                headers: {
                    "x-api-key": options.apiKey,
                },
            },
        );
    } catch (error) {
        console.error(
            "[API Observatory SDK]",
            error,
        );
    }
}